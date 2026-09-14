import { domainMeta, DOMAINS } from "@/lib/cisa-content";
import clsx from "clsx";
import type { ReactNode } from "react";

// ── Section header ─────────────────────────────────────────────────────────
export function SectionHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="eyebrow mb-1.5">{eyebrow}</p>
        <h2 className="display text-2xl font-semibold text-ink-50">{title}</h2>
      </div>
      {right}
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────
export function StatCard({
  icon,
  label,
  value,
  sub,
  accent = "#4DD7FD",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="card card-hover p-5">
      <div
        className="mb-3 grid size-9 place-items-center rounded-xl"
        style={{ background: `${accent}1a`, color: accent }}
      >
        {icon}
      </div>
      <p className="display text-3xl font-semibold tracking-tight text-ink-50">{value}</p>
      <p className="mt-1 text-xs font-medium text-ink-300">{label}</p>
      {sub && <p className="mt-0.5 font-mono text-[0.62rem] text-ink-400">{sub}</p>}
    </div>
  );
}

// ── Domain badge ───────────────────────────────────────────────────────────
export function DomainBadge({ domain, showName = false }: { domain: string | null; showName?: boolean }) {
  const meta = domainMeta(domain);
  if (!meta) {
    return <span className="chip">CUSTOM</span>;
  }
  return (
    <span
      className="chip !border-transparent"
      style={{ background: `${meta.color}1a`, color: meta.color }}
    >
      D{meta.id}
      {showName ? ` · ${meta.short}` : ""}
    </span>
  );
}

// ── Difficulty dots ────────────────────────────────────────────────────────
export function DifficultyDots({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-1" title={`Difficulty ${level}/3`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={clsx("size-1.5 rounded-full", i <= level ? "bg-ember-400" : "bg-ink-600")}
        />
      ))}
    </span>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-ink-700/60 text-ink-300">{icon}</div>
      <h3 className="display text-xl font-semibold text-ink-50">{title}</h3>
      <p className="max-w-md text-sm leading-relaxed text-ink-300">{body}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ── Domain weight strip ────────────────────────────────────────────────────
export function DomainWeightStrip() {
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-ink-700">
      {DOMAINS.map((d) => (
        <div key={d.id} style={{ width: `${d.weight}%`, background: d.color }} title={`D${d.id} ${d.name} — ${d.weight}%`} />
      ))}
    </div>
  );
}
