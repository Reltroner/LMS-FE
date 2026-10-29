import Link from "next/link";
import type { GenerationStatus } from "@/lib/knowledge/types";
import type { Message } from "@/lib/assistant/conversation";
import { cn } from "@/lib/utils/cn";

const statusLabels: Record<GenerationStatus, string> = {
  generated: "AI answer · checked against cited sources",
  retrieval_only: "Source excerpts · no AI-generated text",
  abstained: "No supporting source found",
  refused: "Not available · published content only",
  unavailable: "AI generation unavailable",
};

const statusTone: Record<GenerationStatus, string> = {
  generated: "border-success/30 bg-success-soft text-success",
  retrieval_only: "border-primary/25 bg-primary-soft text-primary",
  abstained: "border-border bg-background-elevated text-muted-foreground",
  refused: "border-warning/30 bg-warning-soft text-warning",
  unavailable: "border-warning/30 bg-warning-soft text-warning",
};

// One message in either assistant surface. Citations are links to published pages only (the
// service drops anything it did not retrieve from the public index).
export function GroundedAnswer({ message, compact = false, onRetry, onNavigate, retryDisabled }: {
  message: Message;
  compact?: boolean;
  onRetry?: (question: string) => void;
  onNavigate?: () => void;
  retryDisabled?: boolean;
}) {
  if (message.role === "user") {
    return (
      <div className="ml-auto max-w-[85%] whitespace-pre-line rounded-2xl bg-primary px-4 py-2.5 text-sm leading-6 text-primary-foreground">
        <span className="sr-only">You asked: </span>{message.content}
      </div>
    );
  }

  const status = message.state === "loading" ? undefined : message.generationStatus;
  const sources = message.sources ?? [];
  const excerptsOnly = status === "retrieval_only" && sources.length > 0;

  return (
    <div className={cn("flex max-w-[92%] flex-col gap-2", message.state === "loading" && "animate-pulse")}>
      {status && (
        <span className={cn("w-fit rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", statusTone[status])}>
          {statusLabels[status]}
        </span>
      )}
      <div className={cn("whitespace-pre-line rounded-2xl border px-4 py-2.5 leading-6", compact ? "text-[13px]" : "text-sm",
        message.state === "error" ? "border-warning/40 bg-warning-soft text-foreground" : "border-border bg-background-elevated text-foreground")}>
        <span className="sr-only">Guide: </span>
        {excerptsOnly ? "Here are the most relevant passages from published lessons. No AI service wrote this reply." : message.content}
      </div>

      {sources.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-3">
          <p className="text-xs font-semibold text-foreground">{excerptsOnly ? "Relevant excerpts" : "Sources"}</p>
          <ul className="mt-2 space-y-2">
            {sources.map((source) => (
              <li key={`${source.href}-${source.title}`} className="text-xs leading-5">
                <Link href={source.href} onClick={onNavigate} className="font-semibold text-primary underline-offset-2 hover:underline">
                  {source.title}
                </Link>
                {excerptsOnly && source.snippet && <p className="mt-0.5 text-muted-foreground">{source.snippet}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {message.state === "error" && message.retryQuestion && onRetry && (
        <button type="button" disabled={retryDisabled} onClick={() => onRetry(message.retryQuestion!)}
          className="w-fit rounded-lg border border-border bg-card px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/5 disabled:opacity-50">
          Try again
        </button>
      )}
    </div>
  );
}
