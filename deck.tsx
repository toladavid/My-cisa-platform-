"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  RotateCcw,
  Eye,
  Zap,
  ThumbsDown,
  Meh,
  ThumbsUp,
  PartyPopper,
  RefreshCw,
} from "lucide-react";
import clsx from "clsx";
import type { CardDTO } from "@/lib/actions";
import { reviewCard, finishReviewSession, getDueCards } from "@/lib/actions";
import { nextIntervals } from "@/lib/study-engine";
import { domainMeta } from "@/lib/cisa-content";

const RATINGS = [
  { q: 1, label: "Again", hint: "forgot it", icon: ThumbsDown, cls: "text-rose-400 border-rose-400/40 hover:bg-rose-400/15" },
  { q: 3, label: "Hard", hint: "struggled", icon: Meh, cls: "text-ember-400 border-ember-400/40 hover:bg-ember-400/15" },
  { q: 4, label: "Good", hint: "recalled", icon: ThumbsUp, cls: "text-mint-400 border-mint-400/40 hover:bg-mint-400/15" },
  { q: 5, label: "Easy", hint: "instant", icon: Zap, cls: "text-volt-300 border-volt-400/40 hover:bg-volt-400/15" },
];

export function Deck({ initialCards, domain }: { initialCards: CardDTO[]; domain: string }) {
  const router = useRouter();
  const [cards, setCards] = useState(initialCards);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [confident, setConfident] = useState(0);
  const [finished, setFinished] = useState(false);
  const [pending, startTransition] = useTransition();

  const card = cards[idx];
  const meta = card ? domainMeta(card.domain) : undefined;
  const intervals = useMemo(
    () => (card ? nextIntervals({ ef: card.ef, intervalDays: card.intervalDays, reps: card.reps, lapses: 0 }) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [idx, cards.length]
  );

  const rate = (q: number) => {
    if (!card) return;
    const wasConfident = q >= 4;
    startTransition(async () => {
      await reviewCard(card.id, q);
    });
    setReviewed((r) => r + 1);
    if (wasConfident) setConfident((c) => c + 1);
    if (q === 1) {
      // "Again" — push card to the end of the session
      setCards((cs) => {
        const copy = [...cs];
        const [c] = copy.splice(idx, 1);
        copy.push({ ...c, reps: 0 });
        return copy;
      });
      setFlipped(false);
      return;
    }
    if (idx + 1 >= cards.length) {
      const r = reviewed + 1;
      const c = confident + (wasConfident ? 1 : 0);
      startTransition(async () => {
        await finishReviewSession(r, c);
      });
      setFinished(true);
    } else {
      setIdx((i) => i + 1);
      setFlipped(false);
    }
  };

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
      if (flipped) {
        if (e.key === "1") rate(1);
        if (e.key === "2") rate(3);
        if (e.key === "3") rate(4);
        if (e.key === "4") rate(5);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const reload = () => {
    startTransition(async () => {
      const fresh = await getDueCards(25, domain);
      setCards(fresh);
      setIdx(0);
      setFlipped(false);
      setReviewed(0);
      setConfident(0);
      setFinished(false);
    });
  };

  // ── Empty ──
  if (cards.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-vio-400/10 text-vio-400">
          <PartyPopper className="size-7" />
        </span>
        <h3 className="display text-2xl font-semibold text-ink-50">Deck clear</h3>
        <p className="max-w-sm text-sm leading-relaxed text-ink-300">
          No cards are due right now{domain !== "all" ? " in this domain" : ""}. SM-2 has scheduled
          everything you have reviewed — come back later, or pull in more material.
        </p>
        <button className="btn btn-ghost" onClick={reload} disabled={pending}>
          <RefreshCw className={clsx("size-4", pending && "animate-spin")} /> Check again
        </button>
      </div>
    );
  }

  // ── Finished ──
  if (finished) {
    const pct = reviewed > 0 ? Math.round((confident / reviewed) * 100) : 0;
    return (
      <div className="card flex animate-scale-in flex-col items-center gap-5 px-6 py-14 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-mint-400/10 text-mint-400">
          <PartyPopper className="size-7" />
        </span>
        <h3 className="display text-3xl font-semibold text-ink-50">Session complete</h3>
        <p className="max-w-sm text-sm text-ink-300">
          {reviewed} cards reviewed · {confident} recalled confidently ({pct}%). Your next due dates
          just got smarter.
        </p>
        <div className="flex gap-2.5">
          <button className="btn btn-volt" onClick={reload} disabled={pending}>
            <RefreshCw className={clsx("size-4", pending && "animate-spin")} /> Load next batch
          </button>
          <button className="btn btn-ghost" onClick={() => router.push("/")}>Back to dashboard</button>
        </div>
      </div>
    );
  }

  const total = cards.length;
  const passed = reviewed;

  return (
    <div className="select-none">
      {/* progress */}
      <div className="mb-5 flex items-center gap-4">
        <span className="font-mono text-xs text-ink-400">
          {idx + 1}/{total}
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-vio-400 to-volt-400 transition-all duration-500"
            style={{ width: `${(passed / Math.max(1, total)) * 100}%` }}
          />
        </div>
        {passed > 0 && <span className="font-mono text-xs text-mint-400">+{confident}✓</span>}
      </div>

      {/* 3D flip card */}
      <div className="flip-scene">
        <div
          className={clsx("flip-card min-h-[340px] cursor-pointer sm:min-h-[380px]", flipped && "flipped")}
          onClick={() => setFlipped((f) => !f)}
          role="button"
          aria-label="Flip card"
        >
          {/* Front */}
          <div className="flip-face card flex flex-col items-center justify-center p-8 text-center">
            {meta && (
              <span className="chip mb-6" style={{ color: meta.color, background: `${meta.color}14`, borderColor: "transparent" }}>
                Domain {meta.id} · {meta.short}
              </span>
            )}
            <p className="display max-w-2xl whitespace-pre-line text-xl font-medium leading-relaxed text-ink-50 sm:text-2xl">
              {card.front}
            </p>
            <p className="mt-8 flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest text-ink-500">
              <Eye className="size-3.5" /> click or press space to reveal
            </p>
          </div>
          {/* Back */}
          <div
            className="flip-back flip-face card flex flex-col items-center justify-center p-8 text-center"
            style={{ borderColor: "rgba(77,215,253,0.25)", background: "linear-gradient(160deg, rgba(34,184,232,0.08), rgba(13,16,24,0.9))" }}
          >
            {meta && (
              <span className="chip mb-6" style={{ color: meta.color, background: `${meta.color}14`, borderColor: "transparent" }}>
                Answer
              </span>
            )}
            <p className="max-w-2xl whitespace-pre-line text-base leading-relaxed text-ink-100 sm:text-lg">
              {card.back}
            </p>
          </div>
        </div>
      </div>

      {/* rating buttons */}
      <div className={clsx("mt-6 grid grid-cols-2 gap-2.5 transition-all duration-300 sm:grid-cols-4", !flipped && "pointer-events-none opacity-30")}>
        {RATINGS.map((r, i) => (
          <button
            key={r.q}
            onClick={() => rate(r.q)}
            className={clsx(
              "group flex flex-col items-center gap-1 rounded-xl border bg-ink-800/40 px-3 py-3.5 transition-all duration-200",
              r.cls
            )}
          >
            <span className="flex items-center gap-1.5 text-sm font-bold">
              <r.icon className="size-4" /> {r.label}
              <span className="font-mono text-[0.6rem] opacity-60">{i + 1}</span>
            </span>
            <span className="font-mono text-[0.6rem] text-ink-400">
              {r.hint} ·{" "}
              {intervals
                ? r.q === 1
                  ? intervals.again
                  : r.q === 3
                    ? intervals.hard
                    : r.q === 4
                      ? intervals.good
                      : intervals.easy
                : ""}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-5 flex items-center justify-center gap-2 font-mono text-[0.62rem] text-ink-500">
        <RotateCcw className="size-3" /> SM-2 scheduler — hard cards return sooner, easy cards drift away
      </p>
    </div>
  );
}
