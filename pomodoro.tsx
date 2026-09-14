"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Play, Pause, RotateCcw, BrainCircuit, Coffee, Moon, Check } from "lucide-react";
import clsx from "clsx";
import { logFocusSession } from "@/lib/actions";

type PhaseId = "focus" | "short" | "long";

const PHASES: Record<PhaseId, { label: string; minutes: number; color: string; icon: typeof BrainCircuit; hint: string }> = {
  focus: { label: "Deep focus", minutes: 25, color: "#4DD7FD", icon: BrainCircuit, hint: "One topic. Phone away. Recall, don't skim." },
  short: { label: "Short break", minutes: 5, color: "#34D399", icon: Coffee, hint: "Stand up, water, look far away. Resist the scroll." },
  long: { label: "Long break", minutes: 15, color: "#A78BFA", icon: Moon, hint: "After 4 focus blocks. Walk, stretch, breathe." },
};

export function Pomodoro() {
  const [phase, setPhase] = useState<PhaseId>("focus");
  const [totalSec, setTotalSec] = useState(PHASES.focus.minutes * 60);
  const [left, setLeft] = useState(PHASES.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [loggedMinutes, setLoggedMinutes] = useState(0);
  const [pending, startTransition] = useTransition();
  const elapsedRef = useRef(0);

  const conf = PHASES[phase];
  const pct = useMemo(() => ((totalSec - left) / totalSec) * 100, [left, totalSec]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const logElapsed = () => {
    const mins = Math.floor(elapsedRef.current / 60);
    if (mins >= 1) {
      startTransition(async () => {
        await logFocusSession(mins, cycles);
      });
      setLoggedMinutes((m) => m + mins);
      elapsedRef.current -= mins * 60;
    }
  };

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setLeft((l) => {
          if (l <= 1) {
          clearInterval(t);
          setRunning(false);
          if (phase === "focus") {
            // partial tracker already counts each second; flush remainder
            logElapsed();
            setCycles((c) => c + 1);
            setPhase("short");
            setTotalSec(PHASES.short.minutes * 60);
            setLeft(PHASES.short.minutes * 60);
          } else {
            setPhase("focus");
            setTotalSec(PHASES.focus.minutes * 60);
            setLeft(PHASES.focus.minutes * 60);
          }
          try {
            new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAA=").play().catch(() => {});
          } catch {}
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase]);

  const switchPhase = (id: PhaseId) => {
    if (running && phase === "focus") {
      elapsedRef.current += totalSec - left;
      logElapsed();
    }
    setRunning(false);
    setPhase(id);
    setTotalSec(PHASES[id].minutes * 60);
    setLeft(PHASES[id].minutes * 60);
  };

  const toggle = () => setRunning((r) => !r);

  // track partial focus time continuously
  useEffect(() => {
    if (!running || phase !== "focus") return;
    const t = setInterval(() => {
      elapsedRef.current += 1;
      const mins = Math.floor(elapsedRef.current / 60);
      if (mins >= 1) logElapsed();
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase, cycles]);

  const reset = () => {
    setRunning(false);
    setLeft(totalSec);
  };

  return (
    <div className="card mx-auto max-w-xl p-8 text-center sm:p-10">
      {/* Phase switcher */}
      <div className="mb-8 flex justify-center gap-2">
        {(Object.keys(PHASES) as PhaseId[]).map((id) => (
          <button
            key={id}
            onClick={() => switchPhase(id)}
            className={clsx(
              "chip cursor-pointer !px-3.5 !py-2 transition-all",
              phase === id && "!border-transparent"
            )}
            style={
              phase === id
                ? { background: `${PHASES[id].color}1f`, color: PHASES[id].color, boxShadow: `0 0 0 1px ${PHASES[id].color}55` }
                : undefined
            }
          >
            {PHASES[id].label}
          </button>
        ))}
      </div>

      {/* Ring + digits */}
      <div className="relative mx-auto mb-8 grid size-64 place-items-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" strokeWidth="4" className="ring-track" />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            strokeWidth="4"
            stroke={conf.color}
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 46}
            strokeDashoffset={(1 - pct / 100) * 2 * Math.PI * 46}
            className="ring-anim"
            style={{ filter: `drop-shadow(0 0 8px ${conf.color}88)` }}
          />
        </svg>
        <div>
          <p
            className="font-mono text-6xl font-bold tabular-nums tracking-tight text-ink-50"
            style={{ textShadow: `0 0 40px ${conf.color}44` }}
          >
            {fmt(left)}
          </p>
          <p className="eyebrow mt-2" style={{ color: conf.color }}>
            {conf.label}
          </p>
        </div>
      </div>

      <p className="mx-auto mb-8 max-w-sm text-sm leading-relaxed text-ink-300">{conf.hint}</p>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={toggle}
          disabled={pending}
          className="btn btn-volt !h-14 !w-32 !rounded-2xl !text-base"
          style={{ boxShadow: `0 10px 34px -10px ${conf.color}88` }}
        >
          {running ? <Pause className="size-5" /> : <Play className="size-5" />}
          {running ? "Pause" : "Start"}
        </button>
        <button onClick={reset} className="btn btn-ghost !h-14 !w-14 !rounded-2xl" title="Reset timer">
          <RotateCcw className="size-5" />
        </button>
      </div>

      {/* Cycles & saved */}
      <div className="mt-8 flex items-center justify-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className={clsx(
              "grid size-8 place-items-center rounded-lg border transition-all",
              i < cycles % 4 || (cycles > 0 && cycles % 4 === 0 && i < 4)
                ? "border-volt-400/50 bg-volt-400/15 text-volt-300"
                : "border-ink-600 text-ink-600"
            )}
          >
            <Check className="size-3.5" strokeWidth={3} />
          </span>
        ))}
        <span className="ml-2 font-mono text-[0.65rem] text-ink-400">
          {cycles} block{cycles === 1 ? "" : "s"} today · {loggedMinutes} min logged
        </span>
      </div>
    </div>
  );
}
