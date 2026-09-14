"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, User, Check, Loader2, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { DOMAINS } from "@/lib/cisa-content";
import { saveOnboarding } from "@/lib/actions";

const EXPERIENCE = [
  { id: "novice", label: "New to IS audit", hint: "First cert, little audit exposure" },
  { id: "working", label: "Working in IT/audit", hint: "Some audit or security background" },
  { id: "seasoned", label: "Seasoned auditor", hint: "Years of experience, need polish" },
];

export function OnboardingForm({
  initial,
}: {
  initial: {
    name: string;
    examDate: string;
    dailyMinutes: number;
    focusDomains: string[];
    experience: string;
  };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name === "Candidate" ? "" : initial.name);
  const [examDate, setExamDate] = useState(initial.examDate);
  const [minutes, setMinutes] = useState(initial.dailyMinutes);
  const [domains, setDomains] = useState<string[]>(initial.focusDomains);
  const [experience, setExperience] = useState(initial.experience);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const minDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const toggleDomain = (id: string) =>
    setDomains((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));

  return (
    <form
      className="card space-y-7 p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (domains.length === 0) {
          setError("Keep at least one domain in your plan.");
          return;
        }
        startTransition(async () => {
          const res = await saveOnboarding({
            name: name.trim() || "Candidate",
            examDate,
            dailyMinutes: minutes,
            focusDomains: domains,
            experience,
          });
          if (res.ok) router.push("/");
          else setError(res.error ?? "Something went wrong.");
        });
      }}
    >
      {/* Name */}
      <div>
        <label className="eyebrow mb-2 flex items-center gap-2">
          <User className="size-3" /> What should PILOT call you?
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your first name"
          className="w-full rounded-xl border border-ink-600 bg-ink-800/60 px-4 py-3 text-sm text-ink-100 outline-none transition-colors placeholder:text-ink-500 focus:border-volt-400"
        />
      </div>

      {/* Exam date */}
      <div>
        <label className="eyebrow mb-2 flex items-center gap-2">
          <CalendarDays className="size-3" /> CISA exam date
        </label>
        <input
          type="date"
          required
          min={minDate}
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          className="w-full rounded-xl border border-ink-600 bg-ink-800/60 px-4 py-3 font-mono text-sm text-ink-100 outline-none transition-colors [color-scheme:dark] focus:border-volt-400"
        />
        <p className="mt-1.5 text-xs text-ink-400">
          The engine backs out a phased plan — learn, practice, mock &amp; review — from this date.
        </p>
      </div>

      {/* Daily minutes */}
      <div>
        <label className="eyebrow mb-2 flex items-center gap-2">
          <Clock3 className="size-3" /> Study time per day —{" "}
          <span className="!text-volt-300">{minutes} min</span>
        </label>
        <input
          type="range"
          min={15}
          max={240}
          step={15}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="volt-range w-full"
          style={{ ["--fill" as string]: `${((minutes - 15) / (240 - 15)) * 100}%` }}
        />
        <div className="mt-1.5 flex justify-between font-mono text-[0.6rem] text-ink-500">
          <span>15 min · light</span>
          <span>~{Math.max(1, Math.round(minutes / 30))} pomodoros/day</span>
          <span>240 min · intensive</span>
        </div>
      </div>

      {/* Focus domains */}
      <div>
        <label className="eyebrow mb-2">Domains to include</label>
        <div className="grid gap-2">
          {DOMAINS.map((d) => {
            const on = domains.includes(d.id);
            return (
              <button
                type="button"
                key={d.id}
                onClick={() => toggleDomain(d.id)}
                className={clsx(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300",
                  on
                    ? "border-transparent bg-ink-800"
                    : "border-ink-700 bg-transparent opacity-45 hover:opacity-75"
                )}
                style={on ? { boxShadow: `inset 3px 0 0 ${d.color}` } : undefined}
              >
                <span
                  className={clsx(
                    "grid size-5 shrink-0 place-items-center rounded-md border transition-colors",
                    on ? "border-transparent text-ink-950" : "border-ink-500 text-transparent"
                  )}
                  style={on ? { background: d.color } : undefined}
                >
                  <Check className="size-3" strokeWidth={3.5} />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-ink-100">
                    Domain {d.id} — {d.name}
                  </span>
                  <span className="block text-xs text-ink-400">
                    {d.blurb} · <span style={{ color: d.color }}>{d.weight}% of exam</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Experience */}
      <div>
        <label className="eyebrow mb-2">Your starting point</label>
        <div className="grid gap-2 sm:grid-cols-3">
          {EXPERIENCE.map((x) => (
            <button
              type="button"
              key={x.id}
              onClick={() => setExperience(x.id)}
              className={clsx(
                "rounded-xl border px-4 py-3 text-left transition-all duration-300",
                experience === x.id
                  ? "border-volt-400/60 bg-volt-400/10"
                  : "border-ink-700 hover:border-ink-500"
              )}
            >
              <span className="block text-sm font-semibold text-ink-100">{x.label}</span>
              <span className="mt-0.5 block text-[0.7rem] leading-snug text-ink-400">{x.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-400">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-volt w-full !py-3.5 !text-base">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Architecting your plan…
          </>
        ) : (
          <>
            Generate my study plan <ArrowRight className="size-4" />
          </>
        )}
      </button>
    </form>
  );
}
