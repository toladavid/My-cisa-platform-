"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  BookOpen,
  Layers,
  Crosshair,
  Timer,
  FolderUp,
  BarChart3,
  Radical,
} from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/plan", label: "Study Plan", icon: CalendarCheck },
  { href: "/library", label: "Key Points", icon: BookOpen },
  { href: "/study", label: "Flashcards", icon: Layers },
  { href: "/quiz", label: "Quiz Lab", icon: Crosshair },
  { href: "/focus", label: "Focus Timer", icon: Timer },
  { href: "/materials", label: "Materials", icon: FolderUp },
  { href: "/stats", label: "Insights", icon: BarChart3 },
];

const MOBILE_NAV = [NAV[0], NAV[1], NAV[3], NAV[4], NAV[6]];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      {/* ── Desktop sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-ink-700/60 bg-ink-900/60 px-4 py-6 backdrop-blur-md md:flex">
        <Link href="/" className="group mb-10 flex items-center gap-3 px-2">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-volt-400 to-volt-600 text-ink-950 shadow-[0_0_24px_-4px_rgba(77,215,253,0.6)]">
            <Radical className="size-5" strokeWidth={2.5} />
          </span>
          <span className="leading-tight">
            <span className="display block text-xl font-bold tracking-tight text-ink-50">
              PILOT
            </span>
            <span className="eyebrow block !text-[0.55rem]">CISA Prep Engine</span>
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1.5">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-300",
                  active
                    ? "bg-volt-400/10 text-volt-300"
                    : "text-ink-300 hover:bg-ink-700/50 hover:text-ink-100"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-volt-400 shadow-[0_0_12px_rgba(77,215,253,0.8)]" />
                )}
                <item.icon
                  className={clsx(
                    "size-[18px] transition-transform duration-300 group-hover:scale-110",
                    active ? "text-volt-400" : "text-ink-400 group-hover:text-ink-200"
                  )}
                  strokeWidth={2}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="card mt-4 p-4">
          <p className="eyebrow mb-2 !text-[0.55rem]">Blueprint</p>
          <div className="space-y-1.5 font-mono text-[0.62rem] text-ink-300">
            <p>D4 Operations — 26%</p>
            <p>D5 Protection — 26%</p>
            <p>D1 Auditing — 18%</p>
            <p>D2 Governance — 18%</p>
            <p>D3 Acquisition — 12%</p>
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-ink-700/60 bg-ink-950/80 px-5 py-3.5 backdrop-blur-md md:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-volt-400 to-volt-600 text-ink-950">
            <Radical className="size-4" strokeWidth={2.5} />
          </span>
          <span className="display text-lg font-bold text-ink-50">PILOT</span>
        </Link>
        <span className="eyebrow !text-[0.55rem]">CISA Prep</span>
      </header>

      {/* ── Main ── */}
      <main className="pb-24 md:pb-10 md:pl-60">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 md:pt-10">{children}</div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-ink-700/60 bg-ink-900/85 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur-md md:hidden">
        {MOBILE_NAV.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[0.6rem] font-medium transition-colors",
                active ? "text-volt-300" : "text-ink-400"
              )}
            >
              <item.icon className="size-5" strokeWidth={active ? 2.4 : 2} />
              {item.label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
