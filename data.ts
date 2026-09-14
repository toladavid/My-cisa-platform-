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
import { desc, eq, sql } from "drizzle-orm";
import { STUDY_TIPS } from "@/lib/cisa-content";
import { addDaysISO, diffDays, levelFromXp, todayISO } from "@/lib/study-engine";
import { ensureSeeded } from "@/lib/actions";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ProfileDTO {
  id: number;
  name: string;
  examDate: string | null;
  dailyMinutes: number;
  focusDomains: string[];
  experience: string;
  xp: number;
  streak: number;
  bestStreak: number;
}

export interface TaskDTO {
  id: number;
  date: string;
  label: string;
  kind: string;
  domain: string | null;
  target: number | null;
  estMinutes: number;
  done: boolean;
  href: string | null;
}

export interface DashboardData {
  needsSetup: boolean;
  profile: ProfileDTO | null;
  daysLeft: number | null;
  dueCards: number;
  todayTasks: TaskDTO[];
  todayDone: number;
  planTotal: number;
  planDone: number;
  questionCount: number;
  questionCore: number;
  questionMine: number;
  materialCount: number;
  quizCount: number;
  avgAccuracy: number;
  totalMinutes: number;
  weekMinutes: { label: string; minutes: number; date: string }[];
  mastery: Record<string, { total: number; correct: number }>;
  level: { level: number; into: number; need: number; pct: number };
  tip: string;
}

function dayOfYear(): number {
  const now = new Date();
  return Math.floor((now.getTime() - new Date(now.getUTCFullYear(), 0, 0).getTime()) / 86400000);
}

export async function getDashboard(): Promise<DashboardData> {
  const empty: DashboardData = {
    needsSetup: true,
    profile: null,
    daysLeft: null,
    dueCards: 0,
    todayTasks: [],
    todayDone: 0,
    planTotal: 0,
    planDone: 0,
    questionCount: 0,
    questionCore: 0,
    questionMine: 0,
    materialCount: 0,
    quizCount: 0,
    avgAccuracy: 0,
    totalMinutes: 0,
    weekMinutes: [],
    mastery: {},
    level: { level: 1, into: 0, need: 100, pct: 0 },
    tip: STUDY_TIPS[0],
  };
  try {
    await ensureSeeded();
    const today = todayISO();
    const [p] = await db.select().from(profiles).limit(1);
    const profile: ProfileDTO | null = p
      ? {
          id: p.id,
          name: p.name,
          examDate: p.examDate,
          dailyMinutes: p.dailyMinutes,
          focusDomains: p.focusDomains ?? [],
          experience: p.experience,
          xp: p.xp,
          streak: p.streak,
          bestStreak: p.bestStreak,
        }
      : null;

    const allTasks = await db.select().from(planTasks).orderBy(planTasks.date, planTasks.id);
    const todayTasks: TaskDTO[] = allTasks
      .filter((t) => t.date === today)
      .map((t) => ({
        id: t.id,
        date: t.date,
        label: t.label,
        kind: t.kind,
        domain: t.domain,
        target: t.target,
        estMinutes: t.estMinutes,
        done: t.done,
        href: t.href,
      }));

    const [qc] = await db.select({ n: sql<number>`count(*)::int` }).from(questions);
    const [qcore] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(questions)
      .where(eq(questions.source, "core"));
    const [mc] = await db.select({ n: sql<number>`count(*)::int` }).from(materials);
    const [sc] = await db.select({ n: sql<number>`count(*)::int` }).from(quizSessions);

    // due flashcards
    const cards = await db.select({ dueAt: flashcards.dueAt }).from(flashcards);
    const now = new Date();
    const dueCards = cards.filter((c) => c.dueAt <= now).length;

    // quiz stats
    const sessions = await db.select().from(quizSessions).orderBy(desc(quizSessions.createdAt)).limit(500);
    const totalQ = sessions.reduce((s, x) => s + x.total, 0);
    const totalCorrect = sessions.reduce((s, x) => s + x.correct, 0);
    const mastery: Record<string, { total: number; correct: number }> = {};
    for (const s of sessions) {
      const b = s.breakdown ?? {};
      for (const [d, v] of Object.entries(b)) {
        if (d === "M") continue;
        if (!mastery[d]) mastery[d] = { total: 0, correct: 0 };
        mastery[d].total += v.total;
        mastery[d].correct += v.correct;
      }
    }

    // study minutes
    const mins = await db.select().from(studySessions).orderBy(desc(studySessions.createdAt)).limit(1000);
    const totalMinutes = mins.reduce((s, x) => s + x.minutes, 0);
    const weekMinutes: { label: string; minutes: number; date: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = addDaysISO(today, -i);
      const label = new Date(date + "T00:00:00Z").toLocaleDateString("en-US", {
        weekday: "short",
        timeZone: "UTC",
      });
      weekMinutes.push({
        label,
        date,
        minutes: mins
          .filter((m) => m.createdAt.toISOString().slice(0, 10) === date)
          .reduce((s, x) => s + x.minutes, 0),
      });
    }

    const daysLeft = profile?.examDate ? diffDays(today, profile.examDate) : null;

    return {
      needsSetup: false,
      profile,
      daysLeft,
      dueCards,
      todayTasks,
      todayDone: todayTasks.filter((t) => t.done).length,
      planTotal: allTasks.length,
      planDone: allTasks.filter((t) => t.done).length,
      questionCount: qc.n,
      questionCore: qcore.n,
      questionMine: qc.n - qcore.n,
      materialCount: mc.n,
      quizCount: sc.n,
      avgAccuracy: totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0,
      totalMinutes,
      weekMinutes,
      mastery,
      level: levelFromXp(profile?.xp ?? 0),
      tip: STUDY_TIPS[dayOfYear() % STUDY_TIPS.length],
    };
  } catch {
    return empty;
  }
}

// ── Plan page ────────────────────────────────────────────────────────────────

export interface PlanData {
  needsSetup: boolean;
  profile: ProfileDTO | null;
  tasks: TaskDTO[];
  daysLeft: number | null;
}

export async function getPlan(): Promise<PlanData> {
  try {
    const [p] = await db.select().from(profiles).limit(1);
    const rows = await db.select().from(planTasks).orderBy(planTasks.date, planTasks.id).limit(4000);
    return {
      needsSetup: false,
      profile: p
        ? {
            id: p.id,
            name: p.name,
            examDate: p.examDate,
            dailyMinutes: p.dailyMinutes,
            focusDomains: p.focusDomains ?? [],
            experience: p.experience,
            xp: p.xp,
            streak: p.streak,
            bestStreak: p.bestStreak,
          }
        : null,
      tasks: rows.map((t) => ({
        id: t.id,
        date: t.date,
        label: t.label,
        kind: t.kind,
        domain: t.domain,
        target: t.target,
        estMinutes: t.estMinutes,
        done: t.done,
        href: t.href,
      })),
      daysLeft: p?.examDate ? diffDays(todayISO(), p.examDate) : null,
    };
  } catch {
    return { needsSetup: true, profile: null, tasks: [], daysLeft: null };
  }
}

// ── Materials ────────────────────────────────────────────────────────────────

export interface MaterialDTO {
  id: number;
  title: string;
  fileName: string | null;
  kind: string;
  wordCount: number;
  createdAt: string;
  counts: { keyPoints: number; flashcards: number; questions: number };
}

export async function getMaterials(): Promise<MaterialDTO[]> {
  try {
    const rows = await db.select().from(materials).orderBy(desc(materials.createdAt)).limit(200);
    const kps = await db.select({ materialId: keyPoints.materialId }).from(keyPoints);
    const cs = await db.select({ materialId: flashcards.materialId }).from(flashcards);
    const qs = await db.select({ materialId: questions.materialId }).from(questions);
    const count = (arr: { materialId: number | null }[], id: number) =>
      arr.filter((x) => x.materialId === id).length;
    return rows.map((m) => ({
      id: m.id,
      title: m.title,
      fileName: m.fileName,
      kind: m.kind,
      wordCount: m.wordCount,
      createdAt: m.createdAt.toISOString(),
      counts: {
        keyPoints: count(kps, m.id),
        flashcards: count(cs, m.id),
        questions: count(qs, m.id),
      },
    }));
  } catch {
    return [];
  }
}

export interface MaterialDetail extends MaterialDTO {
  content: string;
  points: string[];
  cards: { front: string; back: string }[];
  qs: { prompt: string; options: string[]; correctIndex: number; explanation: string }[];
}

export async function getMaterial(id: number): Promise<MaterialDetail | null> {
  try {
    const [m] = await db.select().from(materials).where(eq(materials.id, id)).limit(1);
    if (!m) return null;
    const pts = await db.select().from(keyPoints).where(eq(keyPoints.materialId, id)).limit(40);
    const cds = await db.select().from(flashcards).where(eq(flashcards.materialId, id)).limit(40);
    const qzs = await db.select().from(questions).where(eq(questions.materialId, id)).limit(40);
    return {
      id: m.id,
      title: m.title,
      fileName: m.fileName,
      kind: m.kind,
      wordCount: m.wordCount,
      createdAt: m.createdAt.toISOString(),
      content: m.content,
      counts: { keyPoints: pts.length, flashcards: cds.length, questions: qzs.length },
      points: pts.map((p) => p.text),
      cards: cds.map((c) => ({ front: c.front, back: c.back })),
      qs: qzs.map((q) => ({
        prompt: q.prompt,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      })),
    };
  } catch {
    return null;
  }
}

// ── Library (key points) ────────────────────────────────────────────────────

export interface LibraryData {
  core: Record<string, string[]>;
  mine: { materialId: number; title: string; domain: string | null; points: string[] }[];
}

export async function getLibrary(): Promise<LibraryData> {
  try {
    const pts = await db.select().from(keyPoints).orderBy(keyPoints.id).limit(1200);
    const core: Record<string, string[]> = { "1": [], "2": [], "3": [], "4": [], "5": [] };
    for (const p of pts.filter((x) => x.source === "core")) {
      if (p.domain && core[p.domain]) core[p.domain].push(p.text);
    }
    const mats = await db.select().from(materials).limit(200);
    const mine = mats
      .map((m) => ({
        materialId: m.id,
        title: m.title,
        domain: null as string | null,
        points: pts.filter((p) => p.materialId === m.id).map((p) => p.text),
      }))
      .filter((x) => x.points.length > 0);
    return { core, mine };
  } catch {
    return { core: { "1": [], "2": [], "3": [], "4": [], "5": [] }, mine: [] };
  }
}

// ── Stats / insights ─────────────────────────────────────────────────────────

export interface StatsData {
  needsSetup: boolean;
  mastery: Record<string, { total: number; correct: number }>;
  quizHistory: { id: number; mode: string; total: number; correct: number; durationSec: number; date: string }[];
  totals: { quizzes: number; questionsAnswered: number; accuracy: number; minutes: number };
  cards: { total: number; mastered: number; learning: number; due: number };
  materials: number;
  weekMinutes: { label: string; minutes: number; date: string }[];
}

export async function getStats(): Promise<StatsData> {
  const empty: StatsData = {
    needsSetup: true,
    mastery: {},
    quizHistory: [],
    totals: { quizzes: 0, questionsAnswered: 0, accuracy: 0, minutes: 0 },
    cards: { total: 0, mastered: 0, learning: 0, due: 0 },
    materials: 0,
    weekMinutes: [],
  };
  try {
    const sessions = await db.select().from(quizSessions).orderBy(desc(quizSessions.createdAt)).limit(200);
    const mastery: Record<string, { total: number; correct: number }> = {};
    for (const s of sessions) {
      for (const [d, v] of Object.entries(s.breakdown ?? {})) {
        if (d === "M") continue;
        if (!mastery[d]) mastery[d] = { total: 0, correct: 0 };
        mastery[d].total += v.total;
        mastery[d].correct += v.correct;
      }
    }
    const cards = await db.select().from(flashcards);
    const now = new Date();
    const [mc] = await db.select({ n: sql<number>`count(*)::int` }).from(materials);
    const mins = await db.select().from(studySessions).limit(1500);
    const today = todayISO();
    const weekMinutes: StatsData["weekMinutes"] = [];
    for (let i = 6; i >= 0; i--) {
      const date = addDaysISO(today, -i);
      weekMinutes.push({
        label: new Date(date + "T00:00:00Z").toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
        date,
        minutes: mins.filter((m) => m.createdAt.toISOString().slice(0, 10) === date).reduce((s, x) => s + x.minutes, 0),
      });
    }
    const totalQ = sessions.reduce((s, x) => s + x.total, 0);
    const totalC = sessions.reduce((s, x) => s + x.correct, 0);
    return {
      needsSetup: false,
      mastery,
      quizHistory: sessions.slice(0, 12).map((s) => ({
        id: s.id,
        mode: s.mode,
        total: s.total,
        correct: s.correct,
        durationSec: s.durationSec,
        date: s.createdAt.toISOString(),
      })),
      totals: {
        quizzes: sessions.length,
        questionsAnswered: totalQ,
        accuracy: totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0,
        minutes: mins.reduce((s, x) => s + x.minutes, 0),
      },
      cards: {
        total: cards.length,
        mastered: cards.filter((c) => c.intervalDays >= 21).length,
        learning: cards.filter((c) => c.intervalDays < 21 && c.reps > 0).length,
        due: cards.filter((c) => c.dueAt <= now).length,
      },
      materials: mc.n,
      weekMinutes,
    };
  } catch {
    return empty;
  }
}
