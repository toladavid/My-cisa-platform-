"use server";

import { db } from "@/db";
import {
  profiles,
  materials,
  keyPoints,
  flashcards,
  questions,
  quizSessions,
  studySessions,
  planTasks,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  CORE_KEY_POINTS,
  CORE_FLASHCARDS,
  CORE_QUESTIONS,
} from "@/lib/cisa-content";
import {
  buildFlashcards,
  buildQuestions,
  classifyDomain,
  extractKeywords,
  generatePlanTasks,
  normalizeText,
  parsePastQuestions,
  selectKeyPoints,
  shuffleArray,
  sm2,
  todayISO,
  wordCount,
  addDaysISO,
} from "@/lib/study-engine";

// ── Internal helpers ─────────────────────────────────────────────────────────

async function ensureProfile() {
  const rows = await db.select().from(profiles).limit(1);
  if (rows.length > 0) return rows[0];
  const [created] = await db.insert(profiles).values({}).returning();
  return created;
}

async function touchStreak() {
  const p = await ensureProfile();
  const today = todayISO();
  if (p.lastStudiedOn === today) return;
  const yesterday = addDaysISO(today, -1);
  const streak = p.lastStudiedOn === yesterday ? p.streak + 1 : 1;
  await db
    .update(profiles)
    .set({ streak, bestStreak: Math.max(streak, p.bestStreak), lastStudiedOn: today })
    .where(eq(profiles.id, p.id));
}

async function awardXp(delta: number) {
  if (delta <= 0) return;
  const p = await ensureProfile();
  await db
    .update(profiles)
    .set({ xp: p.xp + Math.round(delta) })
    .where(eq(profiles.id, p.id));
}

// ── Seeding ──────────────────────────────────────────────────────────────────

export async function ensureSeeded(): Promise<{ seeded: boolean }> {
  try {
    const [q] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(questions);
    if (q.n > 0) return { seeded: false };

    await db.insert(keyPoints).values(
      CORE_KEY_POINTS.map((k) => ({ domain: k.domain, text: k.text, source: "core" }))
    );
    // Stagger initial due dates so the whole deck isn't due at once
    const now = Date.now();
    await db.insert(flashcards).values(
      CORE_FLASHCARDS.map((c, i) => ({
        domain: c.domain,
        front: c.front,
        back: c.back,
        source: "core",
        dueAt: new Date(now + Math.floor(i / 8) * 86400000 * 0), // all due now, easy ramp via deck limit
      }))
    );
    await db.insert(questions).values(
      CORE_QUESTIONS.map((q) => ({
        domain: q.domain,
        source: "core",
        prompt: q.q,
        options: q.o,
        correctIndex: q.a,
        explanation: q.x,
        difficulty: q.d,
      }))
    );
    return { seeded: true };
  } catch {
    return { seeded: false };
  }
}

// ── Onboarding & plan ────────────────────────────────────────────────────────

export interface OnboardingInput {
  name: string;
  examDate: string; // YYYY-MM-DD
  dailyMinutes: number;
  focusDomains: string[];
  experience: string;
}

export async function saveOnboarding(input: OnboardingInput): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!input.examDate) return { ok: false, error: "Pick your exam date." };
    if (input.examDate <= todayISO()) return { ok: false, error: "Exam date must be in the future." };
    const p = await ensureProfile();
    await db
      .update(profiles)
      .set({
        name: input.name.slice(0, 60) || "Candidate",
        examDate: input.examDate,
        dailyMinutes: Math.min(480, Math.max(15, input.dailyMinutes)),
        focusDomains: input.focusDomains,
        experience: input.experience,
      })
      .where(eq(profiles.id, p.id));
    await rebuildPlan(input.examDate, input.dailyMinutes, input.focusDomains);
    revalidatePath("/");
    revalidatePath("/plan");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: "Could not save — is the database ready?" };
  }
}

async function rebuildPlan(examDate: string, dailyMinutes: number, focusDomains: string[]) {
  await db.delete(planTasks);
  const tasks = generatePlanTasks(examDate, dailyMinutes, focusDomains);
  const CHUNK = 80;
  for (let i = 0; i < tasks.length; i += CHUNK) {
    await db.insert(planTasks).values(
      tasks.slice(i, i + CHUNK).map((t) => ({
        date: t.date,
        label: t.label,
        kind: t.kind,
        domain: t.domain ?? null,
        target: t.target ?? null,
        estMinutes: t.estMinutes,
        href: t.href ?? null,
      }))
    );
  }
}

export async function regeneratePlan(): Promise<{ ok: boolean; error?: string }> {
  try {
    const p = await ensureProfile();
    if (!p.examDate) return { ok: false, error: "Set your exam date first." };
    await rebuildPlan(p.examDate, p.dailyMinutes, p.focusDomains ?? []);
    revalidatePath("/plan");
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not regenerate plan." };
  }
}

export async function toggleTask(id: number, done: boolean): Promise<{ ok: boolean }> {
  try {
    await db
      .update(planTasks)
      .set({ done, doneAt: done ? new Date() : null })
      .where(eq(planTasks.id, id));
    if (done) {
      await awardXp(15);
      await touchStreak();
    }
    revalidatePath("/plan");
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// ── Materials ingestion ──────────────────────────────────────────────────────

export interface IngestResult {
  ok: boolean;
  error?: string;
  materialId?: number;
  stats?: { keyPoints: number; flashcards: number; questions: number; words: number };
}

export async function ingestMaterial(input: {
  title: string;
  fileName?: string;
  kind: string;
  content: string;
}): Promise<IngestResult> {
  try {
    const content = normalizeText(input.content);
    if (content.length < 200)
      return { ok: false, error: "Not enough text found (need at least a few paragraphs)." };
    const title = (input.title || input.fileName || "Untitled material").slice(0, 120);

    const [mat] = await db
      .insert(materials)
      .values({
        title,
        fileName: input.fileName ?? null,
        kind: input.kind || "text",
        content,
        wordCount: wordCount(content),
      })
      .returning();

    // 1. Parse embedded past questions first (highest fidelity)
    const past = parsePastQuestions(content, "M");
    for (const pq of past) {
      if (pq.domain === "M") pq.domain = classifyDomain(pq.prompt);
    }

    // 2. Key points
    const kws = extractKeywords(content, 14);
    const points = selectKeyPoints(content, kws, 12);
    if (points.length) {
      await db.insert(keyPoints).values(
        points.map((t) => ({
          materialId: mat.id,
          domain: classifyDomain(t) === "M" ? null : classifyDomain(t),
          text: t.slice(0, 600),
          source: "material",
        }))
      );
    }

    // 3. Flashcards
    const materialDomain = classifyDomain(content.slice(0, 4000));
    const cards = buildFlashcards(content, materialDomain);
    if (cards.length) {
      await db.insert(flashcards).values(
        cards.map((c) => ({
          materialId: mat.id,
          domain: c.domain === "M" ? (materialDomain === "M" ? "2" : materialDomain) : c.domain,
          front: c.front.slice(0, 800),
          back: c.back.slice(0, 1200),
          source: "material",
        }))
      );
    }

    // 4. Generated questions (with core fallback definitions as distractors)
    const { FALLBACK_DEFS } = await import("@/lib/cisa-content");
    const gen = buildQuestions(
      content,
      FALLBACK_DEFS.map((d) => ({ term: d.term, definition: d.definition })),
      materialDomain
    );
    const allQuestions = [...past, ...gen];
    if (allQuestions.length) {
      await db.insert(questions).values(
        allQuestions.map((q) => ({
          materialId: mat.id,
          domain: q.domain === "M" ? "M" : q.domain,
          source: past.includes(q) ? "uploaded" : "generated",
          prompt: q.prompt.slice(0, 900),
          options: q.options.map((o) => o.slice(0, 600)),
          correctIndex: q.correctIndex,
          explanation: q.explanation.slice(0, 1200),
          difficulty: q.difficulty,
        }))
      );
    }

    revalidatePath("/materials");
    revalidatePath("/");
    return {
      ok: true,
      materialId: mat.id,
      stats: {
        keyPoints: points.length,
        flashcards: cards.length,
        questions: allQuestions.length,
        words: wordCount(content),
      },
    };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Ingestion failed. Try a different format or paste the text." };
  }
}

export async function deleteMaterial(id: number): Promise<{ ok: boolean }> {
  try {
    await db.delete(materials).where(eq(materials.id, id));
    revalidatePath("/materials");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// ── Flashcards (SM-2) ────────────────────────────────────────────────────────

export interface CardDTO {
  id: number;
  domain: string;
  front: string;
  back: string;
  ef: number;
  intervalDays: number;
  reps: number;
  source: string;
}

export async function getDueCards(limit = 25, domain?: string): Promise<CardDTO[]> {
  try {
    const rows = await db.select().from(flashcards).orderBy(flashcards.dueAt).limit(400);
    const now = new Date();
    let due = rows.filter((c) => c.dueAt <= now);
    if (domain && domain !== "all") due = due.filter((c) => c.domain === domain);
    if (due.length < limit) {
      const extras = rows.filter((c) => c.dueAt > now && (!domain || domain === "all" || c.domain === domain));
      due = [...due, ...extras];
    }
    return shuffleArray(due)
      .slice(0, limit)
      .map((c) => ({
        id: c.id,
        domain: c.domain,
        front: c.front,
        back: c.back,
        ef: c.ef,
        intervalDays: c.intervalDays,
        reps: c.reps,
        source: c.source,
      }));
  } catch {
    return [];
  }
}

export async function reviewCard(id: number, quality: number): Promise<{ ok: boolean }> {
  try {
    const [card] = await db.select().from(flashcards).where(eq(flashcards.id, id)).limit(1);
    if (!card) return { ok: false };
    const next = sm2(
      { ef: card.ef, intervalDays: card.intervalDays, reps: card.reps, lapses: card.lapses },
      quality
    );
    await db
      .update(flashcards)
      .set({
        ef: next.ef,
        intervalDays: next.intervalDays,
        reps: next.reps,
        lapses: next.lapses,
        dueAt: next.dueAt,
        lastReviewedAt: new Date(),
      })
      .where(eq(flashcards.id, id));
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function finishReviewSession(
  reviewed: number,
  confident: number
): Promise<{ ok: boolean }> {
  try {
    if (reviewed <= 0) return { ok: true };
    await awardXp(confident * 4 + reviewed * 1);
    await touchStreak();
    await db.insert(studySessions).values({
      kind: "flashcard",
      minutes: Math.max(1, Math.round(reviewed * 0.6)),
      meta: { reviewed, confident },
    });
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// ── Quiz ────────────────────────────────────────────────────────────────────

export interface QuizQuestionDTO {
  id: number;
  domain: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: number;
  source: string;
}

export async function getQuizQuestions(input: {
  domain?: string; // "1".."5" | "materials" | "all"
  count: number;
  difficulty?: number; // optional max difficulty
}): Promise<QuizQuestionDTO[]> {
  try {
    const rows = await db.select().from(questions).limit(2000);
    let pool = rows;
    if (input.domain === "materials") pool = rows.filter((q) => q.materialId !== null);
    else if (input.domain && input.domain !== "all")
      pool = rows.filter((q) => q.domain === input.domain);
    if (input.difficulty) pool = pool.filter((q) => q.difficulty <= (input.difficulty ?? 3));
    const picked = shuffleArray(pool).slice(0, Math.min(50, Math.max(1, input.count)));
    return picked.map((q) => {
      const order = shuffleArray([0, 1, 2, 3]);
      const options = order.map((i) => q.options[i]);
      return {
        id: q.id,
        domain: q.domain,
        prompt: q.prompt,
        options,
        correctIndex: options.indexOf(q.options[q.correctIndex]),
        explanation: q.explanation,
        difficulty: q.difficulty,
        source: q.source,
      };
    });
  } catch {
    return [];
  }
}

export async function submitQuiz(input: {
  mode: string;
  total: number;
  correct: number;
  durationSec: number;
  breakdown: Record<string, { total: number; correct: number }>;
}): Promise<{ ok: boolean }> {
  try {
    await db.insert(quizSessions).values({
      mode: input.mode,
      total: input.total,
      correct: input.correct,
      durationSec: input.durationSec,
      breakdown: input.breakdown,
    });
    await db.insert(studySessions).values({
      kind: "quiz",
      minutes: Math.max(1, Math.round(input.durationSec / 60)),
      meta: { total: input.total, correct: input.correct, mode: input.mode },
    });
    await awardXp(input.correct * 10 + (input.mode === "exam" ? 20 : 0));
    await touchStreak();
    revalidatePath("/");
    revalidatePath("/stats");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// ── Focus sessions ───────────────────────────────────────────────────────────

export async function logFocusSession(minutes: number, cycles: number): Promise<{ ok: boolean }> {
  try {
    if (minutes < 1) return { ok: true };
    await db.insert(studySessions).values({
      kind: "focus",
      minutes: Math.round(minutes),
      meta: { cycles },
    });
    await awardXp(minutes * 0.8);
    await touchStreak();
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
