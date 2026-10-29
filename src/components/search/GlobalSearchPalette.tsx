"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { KnowledgeSearchResult, RetrievalQueryInput } from "@/lib/knowledge/types";
import { ArrowRightIcon, SearchIcon, SparklesIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import {
  aiGuideHref, boundedQuery, MAX_SEARCH_QUERY_CHARS, resultHeading, searchHref, sourceLabel,
} from "./result-meta";

type Retrieve = (input: RetrievalQueryInput) => KnowledgeSearchResult[];
type Option = { kind: "suggestion"; text: string } | { kind: "result"; result: KnowledgeSearchResult };

const suggestions = [
  "What is worldbuilding?",
  "How do fictional conditions shape choices?",
  "Explain the Lumenhaven example",
  "Explore Worldbuilding Operating System",
];

// Accessible combobox in a modal dialog. Results come from the same published knowledge index
// and retrievePublicKnowledge() as /search/ and the AI Guide; nothing here generates text.
export function GlobalSearchPalette({ initialQuery, onClose }: {
  initialQuery: string;
  onClose: (restoreFocus: boolean) => void;
}) {
  const router = useRouter();
  const id = useId();
  const listId = `${id}-list`;
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(boundedQuery(initialQuery));
  const [retrieve, setRetrieve] = useState<Retrieve | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [cursor, setCursor] = useState({ key: "", index: 0 });
  const trimmed = useDeferredValue(query).trim();

  // The index loads on first open, keeping it out of every page's initial JavaScript.
  useEffect(() => {
    let alive = true;
    import("@/lib/knowledge/public-index")
      .then((module) => { if (alive) setRetrieve(() => module.retrievePublicKnowledge); })
      .catch(() => { if (alive) setLoadFailed(true); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => { root.style.overflow = previous; };
  }, []);

  const results = useMemo(() => (retrieve && trimmed ? retrieve({ query: trimmed, limit: 8 }) : []), [retrieve, trimmed]);
  const options: Option[] = trimmed
    ? results.map((result) => ({ kind: "result", result }))
    : suggestions.map((text) => ({ kind: "suggestion", text }));
  // The highlight resets whenever the option list changes (keyed by the query it was made for).
  const active = cursor.key === trimmed ? Math.min(cursor.index, Math.max(options.length - 1, 0)) : 0;
  const activeId = options.length ? `${id}-option-${active}` : undefined;

  function go(href: string) {
    onClose(false);
    router.push(href);
  }

  function activate(option: Option) {
    if (option.kind === "suggestion") {
      setQuery(option.text);
      inputRef.current?.focus();
    } else {
      go(option.result.sourceUrl);
    }
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!options.length) return;
      const step = event.key === "ArrowDown" ? 1 : options.length - 1;
      const index = (active + step) % options.length;
      setCursor({ key: trimmed, index });
      document.getElementById(`${id}-option-${index}`)?.scrollIntoView({ block: "nearest" });
    } else if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      const option = options[active];
      if (option) activate(option);
      else if (trimmed) go(searchHref(trimmed));
    }
  }

  function onDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose(true);
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;
    const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>("input, a[href], button:not([disabled])")]
      .filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }

  const status = loadFailed
    ? "Search could not load. Try the full Search page."
    : !trimmed ? `${suggestions.length} suggested questions`
    : !retrieve ? "Loading the search index…"
    : results.length ? `${results.length} matching ${results.length === 1 ? "source" : "sources"}`
    : "No matching published sources";

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-[#040e21]/70 backdrop-blur-sm sm:px-4 sm:pt-[10vh]"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(true); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} onKeyDown={onDialogKeyDown}
        className="flex h-dvh w-full flex-col overflow-hidden bg-card text-card-foreground shadow-2xl sm:h-auto sm:max-h-[78vh] sm:max-w-2xl sm:rounded-3xl sm:border sm:border-border">
        <h2 id={`${id}-title`} className="sr-only">Search the academy</h2>
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <SearchIcon width={20} height={20} className="shrink-0 text-muted-foreground" />
          <input ref={inputRef} type="text" inputMode="search" enterKeyHint="search" autoComplete="off" spellCheck={false}
            role="combobox" aria-expanded={options.length > 0} aria-controls={listId} aria-autocomplete="list"
            aria-activedescendant={activeId} aria-label="Search lessons, ideas, and questions"
            placeholder="Search lessons, ideas, and questions…" maxLength={MAX_SEARCH_QUERY_CHARS}
            value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={onInputKeyDown}
            className="h-11 min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none" />
          <button type="button" onClick={() => onClose(true)} aria-label="Close search"
            className="inline-flex h-9 shrink-0 items-center rounded-lg border border-border px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <span className="sm:hidden">Close</span>
            <kbd className="hidden font-sans sm:inline">Esc</kbd>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
          <div className="flex items-center justify-between px-2 pb-2">
            <p className="eyebrow">{trimmed ? "Matching sources" : "Suggested questions"}</p>
            <p className="text-xs text-muted-foreground" aria-hidden="true">{trimmed && retrieve ? status : ""}</p>
          </div>
          <p role="status" aria-live="polite" className="sr-only">{status}</p>
          {trimmed && retrieve && results.length > 0 && (
            <p className="px-2 pb-2 text-xs text-muted-foreground">
              Excerpts from published lessons and course pages — no AI-generated text.
            </p>
          )}
          <ul id={listId} role="listbox" aria-label={trimmed ? "Matching sources" : "Suggested questions"} className="space-y-1">
            {options.map((option, index) => (
              <li key={option.kind === "result" ? option.result.chunkId : option.text}
                id={`${id}-option-${index}`} role="option" aria-selected={index === active}
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => { if (index !== active) setCursor({ key: trimmed, index }); }}
                onClick={() => activate(option)}
                className={cn("cursor-pointer rounded-xl px-3 py-2.5", index === active ? "bg-primary-soft" : "hover:bg-background-elevated")}>
                {option.kind === "suggestion" ? (
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <SearchIcon width={15} height={15} className="text-muted-foreground" />{option.text}
                  </span>
                ) : (
                  <span className="block">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-border bg-background-elevated px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        {sourceLabel(option.result)}
                      </span>
                      <span className="text-sm font-semibold text-foreground">{resultHeading(option.result)}</span>
                    </span>
                    <span className="mt-1 line-clamp-2 block text-sm leading-6 text-muted-foreground">{option.result.snippet}</span>
                    <span className="mt-0.5 block truncate text-xs text-primary">{option.result.title} · {option.result.sourceUrl}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
          {trimmed && (loadFailed || (retrieve && results.length === 0)) && (
            <div className="px-2 py-6 text-center">
              <p className="text-sm font-semibold text-foreground">{loadFailed ? "Search could not load." : `No published source matches “${trimmed}”.`}</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a shorter question, or browse the available course.</p>
            </div>
          )}
          {trimmed && !retrieve && !loadFailed && <p className="px-2 py-6 text-center text-sm text-muted-foreground">Loading the search index…</p>}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span className="hidden sm:inline">↑ ↓ to move · Enter to open · Esc to close</span>
          <div className="flex flex-wrap gap-2">
            <Link href={trimmed ? searchHref(trimmed) : "/search/"} onClick={() => onClose(false)}
              className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-border px-3 font-semibold text-foreground hover:border-primary/40 hover:text-primary">
              {trimmed ? "View all results" : "Open full search"} <ArrowRightIcon width={13} height={13} />
            </Link>
            <Link href={trimmed ? aiGuideHref(trimmed) : "/ai/"} onClick={() => onClose(false)}
              className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-border px-3 font-semibold text-foreground hover:border-primary/40 hover:text-primary">
              <SparklesIcon width={13} height={13} /> Continue in AI Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
