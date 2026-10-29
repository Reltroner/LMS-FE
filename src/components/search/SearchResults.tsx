import Link from "next/link";
import type { KnowledgeSearchResult } from "@/lib/knowledge/types";
import { ArrowRightIcon } from "@/components/ui/icons";
import { resultHeading, sourceLabel } from "./result-meta";

// Ranked, source-aware results. Text is rendered as text (never HTML) and every link is a
// published page from the public index.
export function SearchResults({ results }: { results: readonly KnowledgeSearchResult[] }) {
  return (
    <ol className="space-y-3">
      {results.map((result) => {
        const heading = resultHeading(result);
        return (
          <li key={result.chunkId} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border bg-background-elevated px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {sourceLabel(result)}
              </span>
              {heading !== result.title && <span className="text-xs text-muted-foreground">{result.title}</span>}
            </div>
            <h3 className="mt-2 font-semibold text-foreground">{heading}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{result.snippet}</p>
            <Link href={result.sourceUrl}
              className="mt-3 inline-flex min-h-6 items-center gap-1 text-sm font-semibold text-primary underline-offset-2 hover:underline">
              View original source<span className="sr-only">: {heading}</span> <ArrowRightIcon width={14} height={14} />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
