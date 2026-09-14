import { DOMAINS } from "@/lib/cisa-content";

// ── Progress ring ──────────────────────────────────────────────────────────
export function ProgressRing({
  pct,
  size = 92,
  stroke = 7,
  color = "#4DD7FD",
  children,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" className="ring-track" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (Math.min(100, Math.max(0, pct)) / 100) * c}
          className="ring-anim"
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

// ── Mastery radar (pentagon over 5 CISA domains) ───────────────────────────
export function MasteryRadar({
  mastery,
  size = 260,
}: {
  mastery: Record<string, { total: number; correct: number }>;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 34;

  const point = (i: number, r: number) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / DOMAINS.length;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const;
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const values = DOMAINS.map((d) => {
    const m = mastery[d.id];
    return m && m.total > 0 ? m.correct / m.total : 0;
  });
  const valuePath =
    values
      .map((v, i) => {
        const [x, y] = point(i, Math.max(0.03, v) * R);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ") + " Z";

  return (
    <svg width="100%" viewBox={`0 0 ${size} ${size}`} className="max-w-[280px]">
      <defs>
        <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4DD7FD" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {gridLevels.map((lvl) => (
        <polygon
          key={lvl}
          points={DOMAINS.map((_, i) => point(i, R * lvl).join(",")).join(" ")}
          fill="none"
          stroke="rgba(141,151,176,0.16)"
          strokeDasharray={lvl === 1 ? "none" : "3 5"}
        />
      ))}
      {DOMAINS.map((_, i) => {
        const [x, y] = point(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(141,151,176,0.12)" />;
      })}
      <path d={valuePath} fill="url(#radarFill)" stroke="#4DD7FD" strokeWidth="2" strokeLinejoin="round" />
      {values.map((v, i) => {
        const [x, y] = point(i, Math.max(0.03, v) * R);
        return <circle key={i} cx={x} cy={y} r="3.5" fill={DOMAINS[i].color} />;
      })}
      {DOMAINS.map((d, i) => {
        const [x, y] = point(i, R + 20);
        return (
          <text
            key={d.id}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#8d97b0"
            fontSize="10"
            fontFamily="var(--font-mono)"
          >
            D{d.id}
          </text>
        );
      })}
    </svg>
  );
}

// ── Weekly study minutes bars ──────────────────────────────────────────────
export function WeekBars({
  data,
  height = 120,
}: {
  data: { label: string; minutes: number; date: string }[];
  height?: number;
}) {
  const max = Math.max(10, ...data.map((d) => d.minutes));
  return (
    <div className="flex items-end gap-2.5" style={{ height }}>
      {data.map((d) => {
        const pct = (d.minutes / max) * 100;
        const isToday = d.date === new Date().toISOString().slice(0, 10);
        return (
          <div key={d.date} className="group flex flex-1 flex-col items-center gap-1.5">
            <span className="font-mono text-[0.6rem] text-ink-300 opacity-0 transition-opacity group-hover:opacity-100">
              {d.minutes}m
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: `${Math.max(3, pct)}%`,
                  background: isToday
                    ? "linear-gradient(180deg,#4DD7FD,#0f93c4)"
                    : "linear-gradient(180deg,#262d40,#1b202e)",
                  boxShadow: isToday ? "0 0 16px rgba(77,215,253,0.35)" : undefined,
                }}
              />
            </div>
            <span className={`font-mono text-[0.6rem] ${isToday ? "text-volt-300" : "text-ink-400"}`}>
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Accuracy trend line ────────────────────────────────────────────────────
export function AccuracyTrend({
  points,
  width = 320,
  height = 80,
}: {
  points: number[]; // 0-100 percentages, chronological
  width?: number;
  height?: number;
}) {
  if (points.length < 2) {
    return (
      <div className="grid h-20 place-items-center rounded-xl border border-dashed border-ink-600 font-mono text-[0.65rem] text-ink-400">
        Complete 2+ quizzes to unlock your trendline
      </div>
    );
  }
  const pad = 8;
  const xs = points.map((_, i) => pad + (i * (width - 2 * pad)) / (points.length - 1));
  const ys = points.map((p) => height - pad - (p / 100) * (height - 2 * pad));
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const area = `${path} L${xs[xs.length - 1]},${height - pad} L${xs[0]},${height - pad} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#34D399" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#trendFill)" />
      <path d={path} fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="2.5" fill="#34D399" />
      ))}
    </svg>
  );
}
