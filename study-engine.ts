// ─────────────────────────────────────────────────────────────────────────────
// PILOT Study Engine
// A learning-science driven engine that powers the CISA prep platform:
//  · Salience-ranked key point extraction (elaborative encoding)
//  · Definition harvest + distractor generation (retrieval practice)
//  · Question synthesis (generative learning / testing effect)
//  · Past-question paper parsing
//  · SM-2 spaced repetition scheduler
//  · Spaced + interleaved study plan generation (distributed practice)
// ─────────────────────────────────────────────────────────────────────────────

export const STOPWORDS = new Set([
  "the","a","an","and","or","but","if","then","else","when","while","of","at","by","for","with",
  "about","against","between","into","through","during","before","after","above","below","to","from",
  "up","down","in","out","on","off","over","under","again","further","once","here","there","all",
  "any","both","each","few","more","most","other","some","such","no","nor","not","only","own","same",
  "so","than","too","very","can","will","just","should","now","is","are","was","were","be","been",
  "being","have","has","had","having","do","does","did","doing","would","could","shall","may","might",
  "must","this","that","these","those","it","its","they","them","their","you","your","we","our","he",
  "she","his","her","as","which","who","whom","what","also","used","use","using","based","within",
  "without","etc","via","example","following","order","ensure","ensures","ensuring","chapter","section",
  "page","fig","figure","table","note","notes","part","include","includes","including","provide",
  "provides","provided","typically","however","therefore","thus","because","either","neither","whether",
  "cisa","question","answer","correct","incorrect","best","most","least","primary",
]);

export const DOMAIN_LEXICONS: Record<string, string[]> = {
  "1": ["audit","auditor","auditing","isaca","evidence","sampling","compliance testing","substantive",
    "charter","materiality","audit risk","inherent risk","control risk","detection risk","caats",
    "fieldwork","workpapers","control self-assessment","continuous auditing","audit plan","findings"],
  "2": ["governance","cobit","steering committee","board","strategy","alignment","value delivery",
    "policy","policies","procedures","standards","balanced scorecard","sla","outsourcing","kpi","kri",
    "segregation of duties","data owner","custodian","risk management","resource optimization","portfolio"],
  "3": ["sdlc","agile","waterfall","prototype","feasibility","business case","requirements","uat",
    "regression","unit testing","integration testing","implementation","migration","conversion",
    "post-implementation","project management","critical path","pert","devops","change management","scrum"],
  "4": ["operations","incident","problem management","itil","capacity","scheduling","database","network",
    "backup","recovery","rto","rpo","bcp","drp","business continuity","disaster","hot site","warm site",
    "cold site","raid","ups","generator","hvac","parallel testing","differential","incremental"],
  "5": ["security","access control","authentication","authorization","encryption","cryptography","symmetric",
    "asymmetric","hash","digital signature","pki","firewall","ids","ips","vpn","biometric","phishing",
    "malware","ransomware","dmz","least privilege","password","kerberos","radius","siem","masking","privacy"],
};

// ─── Date helpers ────────────────────────────────────────────────────────────
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
export function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export function diffDays(fromISO: string, toISO: string): number {
  return Math.round(
    (new Date(toISO + "T00:00:00Z").getTime() - new Date(fromISO + "T00:00:00Z").getTime()) /
      86400000
  );
}

// ─── Text utilities ──────────────────────────────────────────────────────────
export function normalizeText(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/[-‐‑‒–—](?=\n)/g, "") // de-hyphenate line wraps
    .replace(/([a-z])\n(?=[a-z ])/g, "$1 ") // join wrapped lines
    .replace(/[ \t]+/g, " ")
    .replace(/(\d+)\.\s{20,}/g, "$1. ")
    .trim();
}

const SENT_MARK = "";

export function splitSentences(text: string): string[] {
  const cleaned = normalizeText(text);
  const marked = cleaned.replace(/([.!?])\s+(?=[A-Z0-9"“])/gu, `$1${SENT_MARK}`);
  const parts = marked
    .split(new RegExp(`${SENT_MARK}|\\n{2,}|\\n(?=\\s*(?:[•\\-*\\dA-D]+[.)]\\s))`))
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => {
      const words = s.split(" ").length;
      return words >= 6 && words <= 60 && s.length >= 45 && s.length <= 420;
    });
  // dedupe preserving order
  const seen = new Set<string>();
  return parts.filter((s) => {
    const key = s.toLowerCase().replace(/[^a-z0-9 ]/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function extractKeywords(text: string, max = 14): string[] {
  const freq = new Map<string, number>();
  for (const raw of text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/)) {
    const w = raw.replace(/^[aeiou]{0}$/, "").trim();
    if (w.length < 4 || STOPWORDS.has(w) || /^\d+$/.test(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return [...freq.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[0].length > 8 && b[1] === a[1] ? -1 : b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w);
}

function keywordOverlap(sentence: string, keywords: string[]): number {
  const lower = sentence.toLowerCase();
  let score = 0;
  for (const k of keywords) if (lower.includes(k)) score += 1 + k.length / 10;
  return score;
}

const SALIENCE_CUES: [RegExp, number][] = [
  [/\b(is|are)\s+defined\s+as\b/i, 4],
  [/\brefers\s+to\b/i, 3.5],
  [/\bis\s+(the|an?)\s+(process|set|framework|practice|principle|act)\b/i, 2.5],
  [/\b(must|shall|required|mandatory|critical|essential|key principle)\b/i, 2],
  [/\b(best|primary|most important)\b/i, 1.5],
  [/\b(first|second|third|finally)\b/i, 1.2],
  [/\b(includes?|consists?\s+of|three|four|five)\b/i, 1],
  [/\bshould be\b/i, 0.8],
];

export function selectKeyPoints(text: string, keywords: string[], max = 10): string[] {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return [];
  const scored = sentences.map((s, idx) => {
    let score = keywordOverlap(s, keywords) * 1.4;
    for (const [re, w] of SALIENCE_CUES) if (re.test(s)) score += w;
    if (idx < sentences.length * 0.15) score += 0.6; // intro bonus
    if (s.length >= 90 && s.length <= 260) score += 1; // ideal readable length
    if (/https?:|www\./i.test(s)) score -= 3;
    // Exclude Q&A artefacts and heading-like fragments
    if (/(answer|explanation|rationale|correct answer)\s*[:\-]/i.test(s)) score -= 50;
    if (/^[A-D][.)]\s/.test(s)) score -= 50;
    if (/\s[A-D][.)]?\s*$/.test(s) || s.includes(" ABCD ")) score -= 50;
    const words = s.replace(/[^a-zA-Z\s]/g, " ").split(/\s+/).filter((w) => w.length > 2);
    const capRatio = words.length ? words.filter((w) => /^\p{Lu}/u.test(w)).length / words.length : 0;
    const hasDefCue = /\b(is|are)\s+(?:defined\s+as|the|an?)\b|\brefers\s+to\b|\bmeans\b/i.test(s);
    if (words.length >= 3 && words.length <= 14 && capRatio > 0.55 && !hasDefCue) score -= 8;
    return { s, score };
  });
  return scored
    .filter((x) => x.score > 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => (x.s.endsWith(".") ? x.s : x.s + "."))
    .sort((a, b) => text.indexOf(a.replace(/\.$/, "")) - text.indexOf(b.replace(/\.$/, "")));
}

// ─── Definition extraction ───────────────────────────────────────────────────
export interface Definition {
  term: string;
  definition: string;
}

const DEF_PATTERNS: RegExp[] = [
  /^([A-Z][\w\s()/-]{2,58}?)\s+(?:is|are)\s+defined\s+as\s+(.{15,320})$/i,
  /^([A-Z][\w\s()/-]{2,58}?)\s+(?:refers to|means|denotes|describes)\s+(.{15,320})$/i,
  /^([A-Z][\w\s()/-]{2,58}?)\s*[:\-—]\s+(.{15,320})$/,
  /^([A-Z][\w\s()/-]{2,58}?)\s+(?:is|are)\s+(?:the|an?)\s+(.{15,320})$/i,
];

export function extractDefinitions(text: string, max = 16): Definition[] {
  const out: Definition[] = [];
  const seen = new Set<string>();
  for (const s of splitSentences(text)) {
    const clean = s.replace(/\.$/, "").trim();
    for (const re of DEF_PATTERNS) {
      const m = clean.match(re);
      if (m) {
        const term = m[1].trim().replace(/\s+/g, " ");
        const def = m[2].trim();
        const tl = term.toLowerCase();
        if (
          term.split(" ").length <= 7 &&
          !STOPWORDS.has(tl) &&
          def.split(" ").length >= 5 &&
          !seen.has(tl)
        ) {
          seen.add(tl);
          out.push({ term, definition: def });
          break;
        }
      }
    }
    if (out.length >= max) break;
  }
  return out;
}

// ─── Domain classification ───────────────────────────────────────────────────
export function classifyDomain(text: string): string {
  const lower = " " + text.toLowerCase() + " ";
  let best = "M";
  let bestScore = 0.5;
  for (const [domain, terms] of Object.entries(DOMAIN_LEXICONS)) {
    let score = 0;
    for (const t of terms) {
      if (lower.includes(" " + t)) score += t.includes(" ") ? 2 : 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = domain;
    }
  }
  return best;
}

// ─── Flashcard generation ────────────────────────────────────────────────────
export interface GenCard {
  front: string;
  back: string;
  domain: string;
}

export function buildFlashcards(text: string, materialDomain: string): GenCard[] {
  const cards: GenCard[] = [];
  const defs = extractDefinitions(text, 12);
  for (const d of defs) {
    cards.push({
      front: `Define: ${d.term}`,
      back: d.definition,
      domain: classifyDomain(d.term + " " + d.definition),
    });
  }
  // Cloze cards from salient sentences
  const kws = extractKeywords(text, 10);
  const sentences = splitSentences(text);
  let added = 0;
  for (const s of sentences) {
    if (added >= 6) break;
    for (const kw of kws) {
      const re = new RegExp(`\\b${kw}\\b`, "i");
      if (re.test(s) && s.length <= 300 && /[.!?]$|^.+$/.test(s)) {
        const front = s.replace(re, "__________");
        if (front !== s) {
          cards.push({
            front: `Complete the statement:\n\n${front}`,
            back: `${kw.charAt(0).toUpperCase() + kw.slice(1)} — ${s.endsWith(".") ? s : s + "."}`,
            domain: materialDomain !== "M" ? materialDomain : classifyDomain(s),
          });
          added++;
          break;
        }
      }
    }
  }
  return cards.slice(0, 14);
}

// ─── Question generation ─────────────────────────────────────────────────────
export interface GenQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: number;
  domain: string;
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildQuestions(
  text: string,
  fallbackDefs: Definition[],
  materialDomain: string
): GenQuestion[] {
  const out: GenQuestion[] = [];
  const defs = extractDefinitions(text, 14);
  const pool = [...defs, ...fallbackDefs.filter((fd) => !defs.some((d) => d.term === fd.term))];

  if (defs.length >= 1 && pool.length >= 4) {
    const used = new Set<string>();
    for (const target of defs.slice(0, 6)) {
      if (used.has(target.term.toLowerCase())) continue;
      used.add(target.term.toLowerCase());
      const distractors = shuffleArray(
        pool.filter((d) => d.term.toLowerCase() !== target.term.toLowerCase())
      ).slice(0, 3);
      const options = shuffleArray([target, ...distractors]).map((d) => d.definition);
      const correctIndex = options.indexOf(target.definition);
      out.push({
        prompt: `Which of the following BEST describes ${target.term}?`,
        options: options.map((o) => o.replace(/\.$/, "")),
        correctIndex,
        explanation: `${target.term} — ${target.definition}.`,
        difficulty: 2,
        domain: classifyDomain(target.term + " " + target.definition) !== "M"
          ? classifyDomain(target.term + " " + target.definition)
          : materialDomain,
      });
    }
  }

  // Statement questions from salient sentences
  const kws = extractKeywords(text, 12);
  const sentences = splitSentences(text);
  const maskSentence = (s: string, kw: string, other: string) =>
    s.replace(new RegExp(`\\b${kw}\\b`, "gi"), other.charAt(0).toUpperCase() + other.slice(1));

  for (const kw of kws) {
    if (out.length >= 8) break;
    const hit = sentences.find(
      (s) => new RegExp(`\\b${kw}\\b`, "i").test(s) && s.length >= 80 && s.length <= 280
    );
    const others = kws.filter((k) => k !== kw);
    if (hit && others.length >= 3) {
      const distractors = shuffleArray(others).slice(0, 3).map((o) => maskSentence(hit, kw, o));
      const correct = hit.endsWith(".") ? hit : hit + ".";
      const options = shuffleArray([correct, ...distractors]);
      out.push({
        prompt: `Which of the following statements about ${kw.toUpperCase()} is CORRECT, according to your study material?`,
        options,
        correctIndex: options.indexOf(correct),
        explanation: `Source material: "${correct}"`,
        difficulty: 2,
        domain: materialDomain !== "M" ? materialDomain : classifyDomain(hit),
      });
    }
  }
  return out.slice(0, 8);
}

// ─── Past-question paper parser ──────────────────────────────────────────────
export function parsePastQuestions(text: string, defaultDomain = "M"): GenQuestion[] {
  const out: GenQuestion[] = [];
  const normalized = text.replace(/\r\n?/g, "\n");
  const blocks = normalized.split(/\n(?=\s*(?:Q(?:uestion)?\s*)?\d{1,3}[.):\s]\s)/i);
  for (const block of blocks) {
    if (out.length >= 60) break;
    // eslint-disable-next-line no-control-regex
    if (block.length > 4000 || block.length < 120) continue;
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const optionIdx: number[] = [];
    lines.forEach((l, i) => {
      if (/^[A-D][.):]\s+\S/.test(l)) optionIdx.push(i);
    });
    if (optionIdx.length < 4) continue;
    const firstOpt = optionIdx[0];
    const prompt = lines
      .slice(0, firstOpt)
      .join(" ")
      .replace(/^(?:Q(?:uestion)?\s*)?\d{1,3}[.):\s]\s*/i, "")
      .trim();
    if (prompt.length < 20) continue;
    const opts: string[] = [];
    for (let k = 0; k < 4; k++) {
      const start = optionIdx[k];
      const end = optionIdx[k + 1] ?? lines.length;
      const chunk = lines.slice(start, end);
      const stopAt = chunk.findIndex((l) => /^(answer|correct answer|ans|explanation|ref)\b/i.test(l));
      const optText = (stopAt >= 0 ? chunk.slice(0, stopAt) : chunk)
        .join(" ")
        .replace(/^[A-D][.):]\s+/, "")
        .trim();
      if (!optText) break;
      opts.push(optText);
    }
    if (opts.length !== 4) continue;
    const rest = lines.slice(optionIdx[3] + 1).join(" ");
    const ansMatch = rest.match(/(?:answer|correct answer|ans)\s*[:\-]?\s*\(?([A-D])\)?/i);
    if (!ansMatch) continue;
    const correctIndex = "ABCD".indexOf(ansMatch[1].toUpperCase());
    const expMatch = rest.match(/(?:explanation|rationale|ref|reference)\s*[:\-]?\s*(.{10,600})/i);
    out.push({
      prompt: prompt.endsWith("?") || prompt.endsWith(".") || prompt.endsWith(":") ? prompt : prompt + "?",
      options: opts,
      correctIndex,
      explanation: expMatch ? expMatch[1].trim() : `Correct answer: ${"ABCD"[correctIndex]}`,
      difficulty: 2,
      domain: classifyDomain(prompt + " " + opts.join(" ")) !== "M"
        ? classifyDomain(prompt + " " + opts.join(" "))
        : defaultDomain,
    });
  }
  return out;
}

// ─── SM-2 Spaced Repetition ──────────────────────────────────────────────────
export interface SRState {
  ef: number;
  intervalDays: number;
  reps: number;
  lapses: number;
}

export function sm2(state: SRState, quality: number): SRState & { dueAt: Date } {
  // quality: 1 (again/error), 3 (hard), 4 (good), 5 (easy)
  let { ef, intervalDays, reps, lapses } = state;
  if (quality < 3) {
    reps = 0;
    lapses += 1;
    intervalDays = 0; // relearn: due in ~10 minutes -> handled by caller adding minutes
  } else {
    reps += 1;
    intervalDays = reps === 1 ? 1 : reps === 2 ? 6 : Math.max(Math.round(intervalDays * ef), 1);
    if (quality === 3) intervalDays = Math.max(1, Math.round(intervalDays * 0.6));
    if (quality === 5) intervalDays = Math.round(intervalDays * 1.3);
  }
  ef = Math.max(1.3, ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  const dueAt = new Date();
  if (quality < 3) dueAt.setMinutes(dueAt.getMinutes() + 10);
  else dueAt.setDate(dueAt.getDate() + intervalDays);
  return { ef, intervalDays, reps, lapses, dueAt };
}

export function nextIntervals(state: SRState): { again: string; hard: string; good: string; easy: string } {
  const fmt = (days: number, mins?: number) => {
    if (mins !== undefined) return `${mins} min`;
    if (days <= 0) return "<1 day";
    if (days === 1) return "1 day";
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.round(days / 30)} mo`;
    return `${(days / 365).toFixed(1)} yr`;
  };
  const base = (q: number) => sm2({ ...state }, q);
  return {
    again: fmt(0, 10),
    hard: fmt(Math.max(1, Math.round(base(3).intervalDays * 0.6)) === 1 ? 1 : base(3).intervalDays),
    good: fmt(base(4).intervalDays),
    easy: fmt(base(5).intervalDays),
  };
}

// ─── XP & Levels ─────────────────────────────────────────────────────────────
export function levelFromXp(xp: number): { level: number; into: number; need: number; pct: number } {
  let level = 1;
  let remaining = xp;
  let need = 100;
  while (remaining >= need) {
    remaining -= need;
    level += 1;
    need = Math.round(100 * Math.pow(1.25, level - 1));
  }
  return { level, into: remaining, need, pct: Math.min(100, Math.round((remaining / need) * 100)) };
}

// ─── Study Plan Generation (spaced + interleaved + phased) ──────────────────
export interface PlanTaskInput {
  date: string;
  label: string;
  kind: "reading" | "flashcard" | "quiz" | "focus" | "review" | "mock";
  domain?: string | null;
  target?: number | null;
  estMinutes: number;
  href?: string;
}

export const DOMAIN_WEIGHTS: Record<string, number> = { "1": 18, "2": 18, "3": 12, "4": 26, "5": 26 };

export function generatePlanTasks(
  examDateISO: string,
  dailyMinutes: number,
  focusDomains: string[]
): PlanTaskInput[] {
  const tasks: PlanTaskInput[] = [];
  const today = todayISO();
  const totalDays = Math.max(1, diffDays(today, examDateISO));
  const domains = (focusDomains.length ? focusDomains : ["1", "2", "3", "4", "5"]).sort(
    (a, b) => (DOMAIN_WEIGHTS[b] ?? 0) - (DOMAIN_WEIGHTS[a] ?? 0)
  );

  // Phase boundaries — distributed practice, taper to review
  const learnEnd = Math.max(1, Math.floor(totalDays * 0.55));
  const practiceEnd = Math.max(learnEnd + 1, Math.floor(totalDays * 0.82));

  const focusBlocks = Math.max(1, Math.round(dailyMinutes / 30)); // pomodoro-ish blocks
  const readMin = Math.round(dailyMinutes * 0.3);
  const reviewMin = Math.round(dailyMinutes * 0.25);

  // Assign each domain slices across the learning phase, weighted
  interface Slice { day: number; domain: string; part: number; parts: number; }
  const slices: Slice[] = [];
  {
    const totalWeight = domains.reduce((s, d) => s + (DOMAIN_WEIGHTS[d] ?? 10), 0);
    let cursor = 0;
    for (const d of domains) {
      const share = Math.max(1, Math.round((DOMAIN_WEIGHTS[d] ?? 10) / totalWeight * learnEnd));
      for (let p = 0; p < share; p++) {
        slices.push({ day: (cursor % learnEnd), domain: d, part: p + 1, parts: share });
        cursor++;
      }
    }
  }

  for (let day = 0; day < totalDays; day++) {
    const date = addDaysISO(today, day);
    const isLastWeek = day >= totalDays - 7 && totalDays >= 7;
    const isRestDay = day % 7 === 6 && !isLastWeek; // deliberate recovery day

    // Daily focus blocks (Pomodoro discipline) — the time backbone
    tasks.push({
      date,
      label: `Focus blocks: ${focusBlocks} × 25-minute deep-work pomodoros`,
      kind: "focus",
      estMinutes: focusBlocks * 25 + focusBlocks * 5,
      target: focusBlocks,
      href: "/focus",
    });

    if (isRestDay) {
      tasks.push({
        date,
        label: "Recovery day — lightly review and consolidate notes",
        kind: "review",
        estMinutes: Math.min(30, dailyMinutes),
        href: "/library",
      });
      continue;
    }

    if (day === 0 && totalDays >= 10) {
      tasks.push({
        date,
        label: "Diagnostic baseline: 20-question mixed quiz (untimed, practice mode)",
        kind: "quiz",
        target: 20,
        estMinutes: Math.min(40, dailyMinutes),
        href: "/quiz",
      });
    }

    // Spaced review every day (the forgetting-curve killer)
    tasks.push({
      date,
      label: day === 0 ? "Start your flashcard deck: review today's cards" : "Spaced review: clear due flashcards",
      kind: "flashcard",
      target: 25,
      estMinutes: reviewMin,
      href: "/study",
    });

    if (day < learnEnd) {
      // ── LEARN phase: key-point study, interleaved across domains
      const daySlices = slices.filter((s) => s.day === day % learnEnd && Math.floor(day / learnEnd) === 0);
      if (daySlices.length === 0) continue;
      for (const s of daySlices) {
        tasks.push({
          date,
          label: `Study key points — Domain ${s.domain} (part ${s.part} of ${s.parts})`,
          kind: "reading",
          domain: s.domain,
          estMinutes: readMin,
          href: `/library?domain=${s.domain}`,
        });
      }
    } else if (day < practiceEnd) {
      // ── PRACTICE phase: interleaved quizzing (testing effect)
      const domain = domains[day % domains.length];
      tasks.push({
        date,
        label: `Interleaved practice: 15-question quiz — Domain ${domain}`,
        kind: "quiz",
        domain,
        target: 15,
        estMinutes: Math.max(20, Math.round(dailyMinutes * 0.4)),
        href: `/quiz?domain=${domain}&count=15&mode=practice`,
      });
      if (day % 3 === 1) {
        tasks.push({
          date,
          label: "Upload & process one study document in your Materials library",
          kind: "review",
          estMinutes: 20,
          href: "/materials",
        });
      }
    } else {
      // ── REVIEW phase: mocks + weakest-link attacks
      if ((totalDays - day) % 2 === 0 && !isLastWeek) {
        tasks.push({
          date,
          label: "Timed mock: 30 mixed questions in exam mode",
          kind: "mock",
          target: 30,
          estMinutes: Math.max(45, Math.round(dailyMinutes * 0.6)),
          href: "/quiz?count=30&mode=exam",
        });
      } else {
        tasks.push({
          date,
          label: "Weak-area attack: retake 15 questions in your two lowest-mastery domains",
          kind: "quiz",
          target: 15,
          estMinutes: Math.max(25, Math.round(dailyMinutes * 0.5)),
          href: "/quiz?count=15",
        });
      }
      if (isLastWeek) {
        tasks.push({
          date,
          label: "Final-pass review of all Domain key points (rapid skim + self-explain)",
          kind: "reading",
          estMinutes: Math.round(dailyMinutes * 0.4),
          href: "/library",
        });
      }
    }
  }

  // Exam-day ritual
  tasks.push({
    date: examDateISO,
    label: "EXAM DAY — light key-point skim only, sleep was part of the plan",
    kind: "review",
    estMinutes: 20,
    href: "/library",
  });

  return tasks.sort((a, b) => a.date.localeCompare(b.date));
}
