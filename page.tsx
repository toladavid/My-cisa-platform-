import { Pomodoro } from "@/components/pomodoro";
import { SectionHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function FocusPage() {
  return (
    <div className="space-y-7">
      <SectionHeader eyebrow="Pomodoro protocol" title="Deep work engine" />
      <p className="-mt-4 max-w-xl text-sm leading-relaxed text-ink-400">
        25 minutes of single-topic focus, then a real break. Every completed block is logged,
        earns XP, and keeps your streak alive. Four blocks earn the long break.
      </p>
      <Pomodoro />
    </div>
  );
}
