"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, RefreshCw, Trash2 } from "lucide-react";
import clsx from "clsx";
import { toggleTask, regeneratePlan, deleteMaterial } from "@/lib/actions";

export function TaskToggle({ id, done }: { id: number; done: boolean }) {
  const [checked, setChecked] = useState(done);
  const [pending, startTransition] = useTransition();

  return (
    <button
      aria-label={checked ? "Mark task incomplete" : "Mark task complete"}
      disabled={pending}
      onClick={() => {
        const next = !checked;
        setChecked(next);
        startTransition(async () => {
          await toggleTask(id, next);
        });
      }}
      className={clsx(
        "grid size-6 shrink-0 place-items-center rounded-lg border transition-all duration-300",
        checked
          ? "border-mint-400 bg-mint-400/20 text-mint-300"
          : "border-ink-500 bg-ink-800/60 text-transparent hover:border-volt-400"
      )}
    >
      <Check className="size-3.5" strokeWidth={3} />
    </button>
  );
}

export function RegeneratePlanButton() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      className="btn btn-ghost"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await regeneratePlan();
          if (res.ok) router.refresh();
          else alert(res.error ?? "Could not regenerate plan.");
        })
      }
    >
      <RefreshCw className={clsx("size-4", pending && "animate-spin")} />
      {pending ? "Rebuilding…" : "Regenerate plan"}
    </button>
  );
}

export function DeleteMaterialButton({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      className="btn btn-ghost !p-2.5"
      disabled={pending}
      title="Delete material"
      onClick={() => {
        if (!confirm("Delete this material and everything generated from it?")) return;
        startTransition(async () => {
          await deleteMaterial(id);
          router.refresh();
        });
      }}
    >
      <Trash2 className="size-4" />
    </button>
  );
}
