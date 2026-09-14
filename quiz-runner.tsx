"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Crosshair,
  Play,
  Timer,
  FlaskConical,
  CircleCheck,
  CircleX,
  ChevronRight,
  Flag,
  Loader2,
  RotateCcw,
  Home,
  AlarmClock,
} from "lucide-react";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import type { QuizQuestionDTO } from "@/lib/actions";
import { getQuizQuestions, submitQuiz } from "@/lib/actions";
import { DOMAINS, domainMeta } from "@/lib/cisa-content";
import { ProgressRing } from "@/components/charts";

const SECONDS_PER_Q = 96; // CISA pace: 150 q in 240 min
const COUNTS = [10, 20, 30, 50];

type Phase = "config" | "loading" | "run" | "done";

interface AnswerRec {
  picked: number | null;
}

export function QuizRunner() {
  const router = useRouter();
  const params = useSearchParams();

  const [phase, setPhase] = useState<Phase>("config");
  const [domain, setDomain] = useState<string>(params.get("domain") ?? "all");
  const [count, setCount] = useState(Number(params.get("count") ?? 20));
  const [mode, setMode] = useState<"practice" | "exam">(
    params.get("mode") === "exam" ? "exam" : "practice"
  );
  const [questions, setQuestions] = useState<QuizQuestionDTO[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerRec[]>([]);
  const [locked, setLocked] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<{
    correct: number;
    total: number;
    breakdown: Record<string, { total: number; correct: number }>;
    durationSec: number;
  } | null>(null);
  const submitted = useRef(false);
  const startedAt = useRef<number>(0);

  const q = questions[idx];

  const start = useCallback(
    async (d = domain, c = count, m = mode) => {
      setPhase("loading");
      submitted.current = false;
      const qs = await getQuizQuestions({ domain: d === "materials" ? "materials" : d, count: c });
      if (qs.length === 0) {
        setPhase("config");
        alert("No questions available for that scope yet. Try 'All domains' or upload materials first.");
        return;
      }
      setQuestions(qs);
      setAnswers(qs.map(() => ({ picked: null })));
      setIdx(0);
      setLocked(false);
      setElapsed(0);
      setSecondsLeft(qs.length * (m === "exam" ? SECONDS_PER_Q : 0));
      startedAt.current = Date.now();
      setPhase("run");
    },
    [domain, count, mode]
  );

  // Auto-start from deep links (plan tasks)
  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoStarted.current) return;
    if (params.get("autostart") === "1") {
      autoStarted.current = true;
      start();
    }
  }, [params, start]);

  const finish = useCallback(
    (finalAnswers: AnswerRec[], finalElapsed: number) => {
      if (submitted.current) return;
      submitted.current = true;
      let correct = 0;
      const breakdown: Record<string, { total: number; correct: number }> = {};
      questions.forEach((qq, i) => {
        const ok = finalAnswers[i]?.picked === qq.correctIndex;
        if (ok) correct += 1;
        const d = qq.domain;
        if (!breakdown[d]) breakdown[d] = { total: 0, correct: 0 };
        breakdown[d].total += 1;
        if (ok) breakdown[d].correct += 1;
      });
      const durationSec = Math.max(1, finalElapsed);
      setResult({ correct, total: questions.length, breakdown, durationSec });
      setPhase("done");
      submitQuiz({ mode, total: questions.length, correct, durationSec, breakdown });
    },
    [questions, mode]
  );

  // Exam timer
  useEffect(() => {
    if (phase !== "run") return;
    const t = setInterval(() => {
      setElapsed((e) => e + 1);
      if (mode === "exam") {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(t);
            finish(answers, elapsed + 1);
            return 0;
          }
          return s - 1;
        });
      }
    }, 1000);
    return () => clearInterval(t);
  }, [phase, mode, answers, elapsed, finish]);

  const fmtTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const pick = (oi: number) => {
    if (locked) return;
    setAnswers((a) => {
      const copy = [...a];
      copy[idx] = { picked: oi };
      return copy;
    });
    if (mode === "practice") setLocked(true);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      const finalAnswers =
        mode === "practice" ? answers : answers;
      finish(finalAnswers, elapsed);
    } else {
      setIdx((i) => i + 1);
      setLocked(false);
    }
  };

  const progressPct = useMemo(
    () => (questions.length ? ((idx + (locked || mode === "exam" ? 1 : 0)) / questions.length) * 100 : 0),
    [idx, questions.length, locked, mode]
  );

  /* ── CONFIG ─────────────────────────────────────────────── */
  if (phase === "config" || phase === "loading") {
    return (
      <div className="card mx-auto max-w-2xl p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-mint-400/10 text-mint-400">
            <Crosshair className="size-5" />
          </span>
          <div>
            <h2 className="display text-2xl font-semibold text-ink-50">Quiz configuration</h2>
            <p className="text-xs text-ink-400">Active retrieval — the most efficient way to study</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="eyebrow mb-2.5">Scope</p>
            <div className="flex flex-wrap gap-2">
              {[{ id: "all", label: "All domains", color: "#4DD7FD" },
                ...DOMAINS.map((d) => ({ id: d.id, label: `D${d.id} ${d.short}`, color: d.color })),
                { id: "materials", label: "From my materials", color: "#F472B6" },
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => setDomain(o.id)}
                  className={clsx(
                    "chip cursor-pointer !px-3.5 !py-2 transition-all duration-200 hover:-translate-y-0.5",
                    domain === o.id && "!border-transparent"
                  )}
                  style={domain === o.id ? { background: `${o.color}22`, color: o.color, boxShadow: `0 0 0 1px ${o.color}66` } : undefined}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow mb-2.5">Length</p>
            <div className="flex gap-2">
              {COUNTS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCount(c)}
                  className={clsx(
                    "flex-1 rounded-xl border py-3 font-mono text-sm font-bold transition-all",
                    count === c
                      ? "border-volt-400/60 bg-volt-400/10 text-volt-300"
                      : "border-ink-600 text-ink-300 hover:border-ink-400"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow mb-2.5">Mode</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                onClick={() => setMode("practice")}
                className={clsx(
                  "rounded-xl border p-4 text-left transition-all",
                  mode === "practice"
                    ? "border-mint-400/50 bg-mint-400/10"
                    : "border-ink-600 hover:border-ink-400"
                )}
              >
                <p className="flex items-center gap-2 text-sm font-bold text-ink-50">
                  <FlaskConical className="size-4 text-mint-400" /> Practice
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-400">
                  Instant feedback + explanation after every answer. Learn as you go.
                </p>
              </button>
              <button
                onClick={() => setMode("exam")}
                className={clsx(
                  "rounded-xl border p-4 text-left transition-all",
                  mode === "exam"
                    ? "border-rose-400/50 bg-rose-400/10"
                    : "border-ink-600 hover:border-ink-400"
                )}
              >
                <p className="flex items-center gap-2 text-sm font-bold text-ink-50">
                  <Timer className="size-4 text-rose-400" /> Exam simulation
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-400">
                  {fmtTime(count * SECONDS_PER_Q)} on the clock (real CISA pace), no feedback until review.
                </p>
              </button>
            </div>
          </div>

          <button
            onClick={() => start()}
            disabled={phase === "loading"}
            className="btn btn-volt w-full !py-3.5 !text-base"
          >
            {phase === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Assembling questions…
              </>
            ) : (
              <>
                <Play className="size-4" /> Begin {mode === "exam" ? "simulation" : "practice"}
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ── RESULTS ────────────────────────────────────────────── */
  if (phase === "done" && result) {
    const pct = Math.round((result.correct / Math.max(1, result.total)) * 100);
    const verdict = pct >= 85 ? "Exam-ready form" : pct >= 70 ? "Strong — keep sharpening" : pct >= 55 ? "Building — target the misses" : "Foundational stage — review key points";
    const xpGained = result.correct * 10 + (mode === "exam" ? 20 : 0);
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="card animate-scale-in p-8 text-center">
          <div className="mx-auto mb-4 w-fit">
            <ProgressRing pct={pct} size={140} stroke={10} color={pct >= 70 ? "#34D399" : pct >= 50 ? "#FBBF24" : "#FB7185"}>
              <div>
                <p className="display text-4xl font-bold text-ink-50">{pct}%</p>
                <p className="font-mono text-[0.6rem] uppercase tracking-widest text-ink-400">
                  {result.correct}/{result.total}
                </p>
              </div>
            </ProgressRing>
          </div>
          <h2 className="display text-2xl font-semibold text-ink-50">{verdict}</h2>
          <p className="mt-2 font-mono text-xs text-ink-400">
            {fmtTime(result.durationSec)} · {mode === "exam" ? "exam simulation" : "practice"} · +{xpGained} XP
          </p>
          <div className="mx-auto mt-6 grid max-w-lg grid-cols-5 gap-2">
            {DOMAINS.map((d) => {
              const b = result.breakdown[d.id];
              const dpct = b && b.total ? Math.round((b.correct / b.total) * 100) : null;
              return (
                <div key={d.id} className="rounded-xl bg-ink-800/50 px-2 py-3 text-center">
                  <p className="font-mono text-[0.65rem]" style={{ color: d.color }}>D{d.id}</p>
                  <p className="display mt-1 text-lg font-bold text-ink-50">
                    {dpct === null ? "—" : `${dpct}%`}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
            <button className="btn btn-volt" onClick={() => { setPhase("config"); setResult(null); router.refresh(); }}>
              <RotateCcw className="size-4" /> New quiz
            </button>
            <button className="btn btn-ghost" onClick={() => router.push("/")}>
              <Home className="size-4" /> Dashboard
            </button>
          </div>
        </div>

        {/* Full review */}
        <h3 className="display pt-2 text-xl font-semibold text-ink-50">Full debrief</h3>
        <div className="space-y-3">
          {questions.map((qq, i) => {
            const picked = answers[i]?.picked ?? null;
            const ok = picked === qq.correctIndex;
            const meta = domainMeta(qq.domain);
            return (
              <div key={qq.id} className={clsx("card p-5", !ok && "border-rose-400/25")}>
                <div className="flex items-start gap-3">
                  <span className={clsx("mt-0.5 grid size-6 shrink-0 place-items-center rounded-md", ok ? "bg-mint-400/10 text-mint-400" : "bg-rose-400/10 text-rose-400")}>
                    {ok ? <CircleCheck className="size-3.5" /> : <CircleX className="size-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-relaxed text-ink-50">
                      <span className="mr-1.5 font-mono text-ink-400">{i + 1}.</span>
                      {qq.prompt}
                    </p>
                    <div className="mt-2.5 space-y-1.5">
                      {qq.options.map((o, oi) => (
                        <p
                          key={oi}
                          className={clsx(
                            "rounded-lg border px-3 py-1.5 text-xs leading-relaxed",
                            oi === qq.correctIndex
                              ? "border-mint-400/40 bg-mint-400/10 text-mint-200"
                              : oi === picked
                                ? "border-rose-400/40 bg-rose-400/10 text-rose-300"
                                : "border-ink-700/60 text-ink-400"
                          )}
                        >
                          <span className="mr-2 font-mono font-bold">{"ABCD"[oi]}</span>
                          {o}
                        </p>
                      ))}
                    </div>
                    {qq.explanation && (
                      <p className="mt-2.5 rounded-lg bg-ink-800/50 px-3 py-2 text-xs leading-relaxed text-ink-300">
                        {qq.explanation}
                      </p>
                    )}
                    {meta && (
                      <span className="chip mt-2.5 !text-[0.58rem]" style={{ color: meta.color, background: `${meta.color}14`, borderColor: "transparent" }}>
                        D{meta.id} · {meta.short}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── RUNNING ────────────────────────────────────────────── */
  if (!q) return null;
  const picked = answers[idx]?.picked ?? null;
  const lowTime = mode === "exam" && secondsLeft <= 120;
  const meta = domainMeta(q.domain);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Top bar */}
      <div className="mb-5 flex items-center gap-4">
        <span className="font-mono text-xs text-ink-400">
          {idx + 1}/{questions.length}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-mint-400 to-volt-400 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {mode === "exam" ? (
          <span className={clsx("flex items-center gap-1.5 font-mono text-sm font-bold tabular-nums", lowTime ? "animate-pulse-soft text-rose-400" : "text-ink-100")}>
            <AlarmClock className="size-4" /> {fmtTime(secondsLeft)}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 font-mono text-xs text-ink-400 tabular-nums">
            <Timer className="size-3.5" /> {fmtTime(elapsed)}
          </span>
        )}
      </div>

      {/* Question */}
      <div key={q.id} className="card animate-fade-up p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {meta && (
            <span className="chip !text-[0.6rem]" style={{ color: meta.color, background: `${meta.color}14`, borderColor: "transparent" }}>
              D{meta.id} · {meta.short}
            </span>
          )}
          <span className="chip !text-[0.6rem]">
            {"●".repeat(q.difficulty)}{"○".repeat(3 - q.difficulty)}
          </span>
          {q.source === "uploaded" && <span className="chip !text-[0.6rem] !text-d5">PAST PAPER</span>}
          {q.source === "generated" && <span className="chip !text-[0.6rem] !text-vio-400">FROM YOUR NOTES</span>}
        </div>

        <h2 className="display text-xl font-medium leading-relaxed text-ink-50 sm:text-2xl">
          {q.prompt}
        </h2>

        <div className="mt-6 space-y-2.5">
          {q.options.map((o, oi) => {
            const isPicked = picked === oi;
            const isCorrect = oi === q.correctIndex;
            const showState = mode === "practice" && locked;
            return (
              <button
                key={oi}
                onClick={() => pick(oi)}
                className={clsx(
                  "group flex w-full items-start gap-3.5 rounded-xl border px-4 py-3.5 text-left transition-all duration-200",
                  showState
                    ? isCorrect
                      ? "border-mint-400/60 bg-mint-400/10"
                      : isPicked
                        ? "border-rose-400/60 bg-rose-400/10"
                        : "border-ink-700 opacity-50"
                    : isPicked
                      ? "border-volt-400/60 bg-volt-400/10"
                      : "border-ink-700 bg-ink-800/30 hover:border-ink-500 hover:bg-ink-800/60"
                )}
              >
                <span
                  className={clsx(
                    "grid size-7 shrink-0 place-items-center rounded-lg border font-mono text-xs font-bold transition-colors",
                    showState
                      ? isCorrect
                        ? "border-mint-400 bg-mint-400 text-ink-950"
                        : isPicked
                          ? "border-rose-400 bg-rose-400 text-ink-950"
                          : "border-ink-600 text-ink-400"
                      : isPicked
                        ? "border-volt-400 bg-volt-400 text-ink-950"
                        : "border-ink-600 text-ink-300 group-hover:border-ink-400"
                  )}
                >
                  {"ABCD"[oi]}
                </span>
                <span className="pt-0.5 text-sm leading-relaxed text-ink-100">{o}</span>
                {showState && isCorrect && <CircleCheck className="ml-auto mt-1 size-4 shrink-0 text-mint-400" />}
                {showState && isPicked && !isCorrect && <CircleX className="ml-auto mt-1 size-4 shrink-0 text-rose-400" />}
              </button>
            );
          })}
        </div>

        {/* Practice-mode feedback */}
        {mode === "practice" && locked && (
          <div
            className={clsx(
              "mt-5 animate-fade-up rounded-xl border px-4 py-3.5",
              picked === q.correctIndex
                ? "border-mint-400/30 bg-mint-400/5"
                : "border-rose-400/30 bg-rose-400/5"
            )}
          >
            <p className={clsx("mb-1 text-sm font-bold", picked === q.correctIndex ? "text-mint-400" : "text-rose-400")}>
              {picked === q.correctIndex ? "Correct — retrieval strengthened." : "Not quite — this is the valuable kind of mistake."}
            </p>
            <p className="text-sm leading-relaxed text-ink-200">{q.explanation}</p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            className="btn btn-ghost !text-xs"
            onClick={() => {
              if (confirm("End this quiz now and review your answers?")) finish(answers, elapsed);
            }}
          >
            <Flag className="size-3.5" /> End & review
          </button>
          <button
            onClick={next}
            disabled={mode === "practice" ? !locked : false}
            className={clsx("btn", mode === "practice" ? "btn-volt" : "btn-ghost")}
          >
            {idx + 1 >= questions.length ? "Finish" : "Next"} <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
