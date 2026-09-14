"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  FileUp,
  ClipboardPaste,
  Loader2,
  Sparkles,
  FileDigit,
  CircleAlert,
  X,
} from "lucide-react";
import clsx from "clsx";
import { ingestMaterial } from "@/lib/actions";

type Mode = "file" | "paste";

interface PipelineState {
  stage: string;
  fileName?: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfjsLib?: any;
  }
}

async function ensurePdfJs(): Promise<void> {
  if (window.pdfjsLib) return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load the PDF reader (check connection)."));
    document.head.appendChild(s);
  });
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

async function extractPdfText(file: File, onPage: (n: number, total: number) => void): Promise<string> {
  await ensurePdfJs();
  const buf = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
  let out = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    onPage(i, pdf.numPages);
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    out += tc.items.map((it: any) => ("str" in it ? it.str : "")).join(" ") + "\n";
    if (out.length > 400_000) break; // sanity cap
  }
  return out;
}

const TEXT_EXT = /\.(txt|md|markdown|csv|json|text)$/i;

export function UploadBox() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("file");
  const [title, setTitle] = useState("");
  const [paste, setPaste] = useState("");
  const [dragging, setDragging] = useState(false);
  const [pipeline, setPipeline] = useState<PipelineState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ keyPoints: number; flashcards: number; questions: number; words: number } | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const busy = pending || pipeline !== null;

  const runIngest = useCallback(
    (payload: { title: string; fileName?: string; kind: string; content: string }) => {
      setPipeline({ stage: "Mining key points & generating questions…", fileName: payload.fileName });
      startTransition(async () => {
        const res = await ingestMaterial(payload);
        setPipeline(null);
        if (!res.ok) {
          setError(res.error ?? "Ingestion failed.");
          return;
        }
        setDone(res.stats ?? null);
        setPaste("");
        setTitle("");
        router.refresh();
        setTimeout(() => setDone(null), 9000);
      });
    },
    [router]
  );

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setDone(null);
      const isPdf = /\.pdf$/i.test(file.name) || file.type === "application/pdf";
      try {
        if (isPdf) {
          setPipeline({ stage: "Loading PDF engine…", fileName: file.name });
          const text = await extractPdfText(file, (n, total) =>
            setPipeline({ stage: `Reading page ${n} of ${total}…`, fileName: file.name })
          );
          if (text.trim().length < 200) {
            setPipeline(null);
            setError("That PDF looks image-based (scanned). Paste the text instead, or export a text PDF.");
            return;
          }
          setPipeline({ stage: "Analyzing extracted text…", fileName: file.name });
          runIngest({
            title: title.trim() || file.name.replace(/\.pdf$/i, ""),
            fileName: file.name,
            kind: "pdf",
            content: text,
          });
        } else if (TEXT_EXT.test(file.name) || file.type.startsWith("text/")) {
          const text = await file.text();
          runIngest({
            title: title.trim() || file.name.replace(TEXT_EXT, ""),
            fileName: file.name,
            kind: "file",
            content: text,
          });
        } else {
          setError("Unsupported format. Use PDF, TXT, MD, CSV or JSON — or paste the text directly.");
        }
      } catch (e) {
        setPipeline(null);
        setError(e instanceof Error ? e.message : "Could not read that file.");
      }
    },
    [runIngest, title]
  );

  return (
    <div className="card p-6 sm:p-7">
      {/* Mode tabs */}
      <div className="mb-6 flex gap-2">
        {(
          [
            { id: "file", label: "Upload file", icon: FileUp },
            { id: "paste", label: "Paste text", icon: ClipboardPaste },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setMode(t.id)}
            className={clsx(
              "btn !py-2.5 !text-xs",
              mode === t.id ? "btn-volt" : "btn-ghost"
            )}
          >
            <t.icon className="size-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Material title (optional — defaults to file name)"
        disabled={busy}
        className="mb-4 w-full rounded-xl border border-ink-600 bg-ink-800/60 px-4 py-3 text-sm text-ink-100 outline-none transition-colors placeholder:text-ink-500 focus:border-volt-400"
      />

      {mode === "file" ? (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f && !busy) handleFile(f);
            }}
            onClick={() => !busy && fileInput.current?.click()}
            className={clsx(
              "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-300",
              dragging
                ? "border-volt-400 bg-volt-400/10"
                : "border-ink-600 hover:border-ink-400 hover:bg-ink-800/30",
              busy && "pointer-events-none opacity-60"
            )}
          >
            <span className="grid size-14 place-items-center rounded-2xl bg-volt-400/10 text-volt-400">
              {busy ? <Loader2 className="size-6 animate-spin" /> : <FileText className="size-6" />}
            </span>
            <p className="text-sm font-semibold text-ink-100">
              {dragging ? "Drop it — PILOT will mine it" : "Drag & drop your study material"}
            </p>
            <p className="max-w-sm text-xs leading-relaxed text-ink-400">
              PDF, TXT, MD, CSV or JSON — study notes, review manuals, or past-question papers.
              Text stays private in your own database.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Notes", "Summaries", "Past questions", "Flash decks"].map((x) => (
                <span key={x} className="chip !text-[0.6rem]">{x}</span>
              ))}
            </div>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.txt,.md,.markdown,.csv,.json,.text,text/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          <p className="mt-3 flex items-start gap-2 text-[0.7rem] leading-relaxed text-ink-500">
            <FileDigit className="mt-0.5 size-3.5 shrink-0" />
            Past-question papers are auto-detected: format like “12. Question text / A. … / B. … /
            C. … / D. … / Answer: B” imports straight into your question bank with the correct
            answers preserved.
          </p>
        </>
      ) : (
        <>
          <textarea
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            disabled={busy}
            rows={10}
            placeholder="Paste your study notes, a chapter summary, or a block of past questions here…"
            className="nice-scroll w-full resize-y rounded-xl border border-ink-600 bg-ink-800/60 px-4 py-3 font-mono text-xs leading-relaxed text-ink-100 outline-none transition-colors placeholder:text-ink-500 focus:border-volt-400"
          />
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="font-mono text-[0.65rem] text-ink-400">
              {paste.split(/\s+/).filter(Boolean).length} words
            </span>
            <button
              className="btn btn-volt"
              disabled={busy || paste.trim().length < 200}
              onClick={() => {
                setError(null);
                runIngest({
                  title: title.trim() || "Pasted notes",
                  kind: "paste",
                  content: paste,
                });
              }}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Extract & generate
            </button>
          </div>
        </>
      )}

      {/* Pipeline status */}
      {pipeline && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-volt-400/30 bg-volt-400/5 px-4 py-3">
          <Loader2 className="size-4 animate-spin text-volt-400" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-volt-300">{pipeline.stage}</p>
            {pipeline.fileName && (
              <p className="truncate font-mono text-[0.65rem] text-ink-400">{pipeline.fileName}</p>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-rose-400" />
          <p className="flex-1 text-sm text-rose-300">{error}</p>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-300">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Success */}
      {done && (
        <div className="mt-5 animate-scale-in rounded-xl border border-mint-400/30 bg-mint-400/10 px-4 py-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-mint-300">
            <Sparkles className="size-4" /> Material mined successfully
          </p>
          <div className="flex flex-wrap gap-2 font-mono text-[0.68rem] text-mint-200">
            <span className="chip !border-mint-400/40 !bg-transparent !text-mint-300">
              {done.keyPoints} key points
            </span>
            <span className="chip !border-mint-400/40 !bg-transparent !text-mint-300">
              {done.flashcards} flashcards
            </span>
            <span className="chip !border-mint-400/40 !bg-transparent !text-mint-300">
              {done.questions} questions
            </span>
            <span className="chip !border-mint-400/40 !bg-transparent !text-mint-300">
              {done.words.toLocaleString()} words
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
