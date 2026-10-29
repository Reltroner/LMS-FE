"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useMemo, useRef, useState, type SubmitEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SearchIcon, SparklesIcon } from "@/components/ui/icons";
import { publicKnowledgeIndex, retrievePublicKnowledge } from "@/lib/knowledge/public-index";
import type { KnowledgeSourceType } from "@/lib/knowledge/types";
import { cn } from "@/lib/utils/cn";
import { SearchResults } from "./SearchResults";
import { aiGuideHref, boundedQuery, MAX_SEARCH_QUERY_CHARS, searchHref } from "./result-meta";

const suggestions = ["What is worldbuilding?", "Condition choice possible effect", "Memory lantern", "Lumenhaven", "Learning path"];
type Filter = "all" | KnowledgeSourceType;
const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All sources" },
  { value: "lesson", label: "Lessons" },
  { value: "course", label: "Courses" },
  { value: "path", label: "Paths" },
];

// Reads ?q= (for example from the Ctrl+K palette's "View all results"). Kept inside Suspense so
// the rest of the page is prerendered.
export function SearchPageFromUrl() {
  return <SearchPage initialQuery={boundedQuery(useSearchParams().get("q"))} />;
}

// Full search over the same public index and retrievePublicKnowledge() as the palette and AI Guide.
export function SearchPage({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(initialQuery.trim());
  const [filter, setFilter] = useState<Filter>("all");

  const results = useMemo(() => (submitted
    ? retrievePublicKnowledge({ query: submitted, limit: 20, ...(filter !== "all" && { scope: { sourceTypes: [filter] } }) })
    : []), [submitted, filter]);

  function run(value: string) {
    const next = boundedQuery(value).trim();
    setQuery(next);
    setSubmitted(next);
    router.replace(next ? searchHref(next) : "/search/", { scroll: false });
  }

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    run(query);
  }

  const sourceCount = publicKnowledgeIndex.chunkCount;
  return (
    <div className="space-y-6">
      <Card className="p-4 sm:p-5">
        <form role="search" onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
          <Input ref={inputRef} type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search published lesson material…" icon={<SearchIcon width={18} height={18} />}
            aria-label="Search" maxLength={MAX_SEARCH_QUERY_CHARS} enterKeyHint="search" />
          <button type="submit" className="h-12 shrink-0 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Search
          </button>
        </form>
        <fieldset className="mt-4">
          <legend className="sr-only">Source type</legend>
          <div className="flex flex-wrap gap-2">
            {filters.map((option) => (
              <label key={option.value}
                className={cn("inline-flex min-h-9 cursor-pointer items-center rounded-full border px-3.5 text-sm font-medium transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                  filter === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground")}>
                <input type="radio" name={`${id}-filter`} value={option.value} checked={filter === option.value}
                  onChange={() => setFilter(option.value)} className="sr-only" />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      </Card>

      {!submitted ? (
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">Try a question</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Searching {sourceCount} passages from published lessons, courses, and paths. Drafts are never indexed.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => run(suggestion)}
                className="min-h-8 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-primary">
                {suggestion}
              </button>
            ))}
          </div>
        </Card>
      ) : (
        <section aria-labelledby={`${id}-results`} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id={`${id}-results`} className="text-lg font-semibold text-foreground">Source results</h2>
            <Link href={aiGuideHref(submitted)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-sm font-semibold text-foreground hover:border-primary/30 hover:text-primary">
              <SparklesIcon width={15} height={15} /> Continue exploring in AI Guide
            </Link>
          </div>
          <p role="status" className="text-sm text-muted-foreground">
            {results.length > 0
              ? `${results.length} ${results.length === 1 ? "passage" : "passages"} for “${submitted}”`
              : `No published source matches “${submitted}”`}
          </p>
          {results.length > 0 ? <SearchResults results={results} /> : (
            <Card className="p-8 text-center">
              <h3 className="text-base font-semibold text-foreground">Nothing matches that search</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Only published lessons, courses, and paths are searchable. Try a shorter question, another source
                type, or browse the course.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm font-semibold">
                <button type="button" onClick={() => { run(""); setFilter("all"); inputRef.current?.focus(); }} className="text-primary hover:underline">Clear search</button>
                <Link href="/courses/" className="text-primary hover:underline">Browse courses</Link>
              </div>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}
