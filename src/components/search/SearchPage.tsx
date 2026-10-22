"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  BookIcon,
  CompassIcon,
  SearchIcon,
  TerminalIcon,
  ArrowRightIcon,
} from "@/components/ui/icons";
import { getPublishedCourses } from "@/lib/fixtures/courses";
import { getPublishedPaths } from "@/lib/fixtures/paths";
import { getLessonsByCourseSlug } from "@/lib/fixtures/lessons";
import { cn } from "@/lib/utils/cn";

type ResultItem = {
  type: "course" | "path" | "lesson";
  id: string;
  title: string;
  summary: string;
  href: string;
  meta: string;
};

const suggestions = [
  "systems thinking",
  "worldbuilding",
  "creative constraints",
  "causal reasoning",
  "learning path",
];

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const courses = useMemo(() => getPublishedCourses(), []);
  const paths = useMemo(() => getPublishedPaths(), []);

  const buildIndex = useCallback((): ResultItem[] => {
    const items: ResultItem[] = [];
    for (const c of courses) {
      items.push({
        type: "course",
        id: c.id,
        title: c.title,
        summary: c.summary,
        href: `/courses/${c.slug}`,
        meta: `${c.modules.length} modules · ~${c.estimatedHours}h`,
      });
      for (const l of getLessonsByCourseSlug(c.slug)) {
        items.push({
          type: "lesson",
          id: l.id,
          title: l.title,
          summary: l.summary,
          href: `/courses/${c.slug}/lessons/${l.slug}`,
          meta: `${c.title} · ${l.durationMinutes}m`,
        });
      }
    }
    for (const p of paths) {
      items.push({
        type: "path",
        id: p.id,
        title: p.title,
        summary: p.summary,
        href: `/paths/${p.slug}`,
        meta: `${p.courseSlugs.length} courses · ~${p.estimatedHours}h`,
      });
    }
    return items;
  }, [courses, paths]);

  const index = useMemo(() => buildIndex(), [buildIndex]);

  const filteredSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suggestions;
    return suggestions.filter((s) => s.toLowerCase().includes(q));
  }, [query]);

  const results = useMemo(() => {
    const q = submitted.trim().toLowerCase();
    if (!q) return [];
    return index
      .filter((item) => {
        const haystack = `${item.title} ${item.summary} ${item.meta}`.toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 30);
  }, [submitted, index]);

  const grouped = useMemo(() => {
    const groups: Record<string, ResultItem[]> = {
      course: [],
      path: [],
      lesson: [],
    };
    for (const r of results) groups[r.type].push(r);
    return groups;
  }, [results]);

  const submit = useCallback((q: string) => {
    setSubmitted(q);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setShowSuggestions(true);
        setActiveSuggestion((i) =>
          Math.min(i + 1, filteredSuggestions.length - 1),
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeSuggestion >= 0 && filteredSuggestions[activeSuggestion]) {
          const s = filteredSuggestions[activeSuggestion];
          setQuery(s);
          submit(s);
        } else {
          submit(query);
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    },
    [activeSuggestion, filteredSuggestions, query, submit],
  );

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const typeConfig = {
    course: { label: "Course", icon: BookIcon, tone: "primary" as const },
    path: { label: "Path", icon: CompassIcon, tone: "accent" as const },
    lesson: { label: "Lesson", icon: TerminalIcon, tone: "neutral" as const },
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search courses, paths, lessons…  (press /)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={onKeyDown}
          icon={<SearchIcon width={18} height={18} />}
          aria-label="Search"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
        />

        {showSuggestions && filteredSuggestions.length > 0 && (
          <Card className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden p-2">
            <ul role="listbox" aria-label="Search suggestions">
              {filteredSuggestions.map((s, i) => (
                <li key={s}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === activeSuggestion}
                    onMouseEnter={() => setActiveSuggestion(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setQuery(s);
                      submit(s);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
                      i === activeSuggestion
                        ? "bg-primary-soft text-primary"
                        : "text-foreground hover:bg-primary/5",
                    )}
                  >
                    <SearchIcon width={16} height={16} className="text-muted-foreground" />
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Try:</span>
        {suggestions.slice(0, 4).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setQuery(s);
              submit(s);
            }}
            className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary/30 hover:text-primary"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Results */}
      {submitted && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {results.length > 0 ? (
                <>
                  <span className="font-semibold text-foreground">{results.length}</span>{" "}
                  result{results.length !== 1 ? "s" : ""} for{" "}
                  <span className="font-semibold text-foreground">“{submitted}”</span>
                </>
              ) : (
                <>No results for “{submitted}”</>
              )}
            </p>
          </div>

          {results.length === 0 ? (
            <Card className="p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-background-elevated">
                <SearchIcon width={26} height={26} className="text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Nothing matches that search
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Only published catalog content is searchable. Try a broader
                term, or browse the catalog directly.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSubmitted("");
                  }}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:border-primary/30 hover:text-primary"
                >
                  Clear search
                </button>
                <Link
                  href="/courses"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Browse courses
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-8">
              {(["course", "path", "lesson"] as const).map((type) => {
                const items = grouped[type];
                if (items.length === 0) return null;
                const cfg = typeConfig[type];
                const Icon = cfg.icon;
                return (
                  <div key={type}>
                    <div className="mb-3 flex items-center gap-2">
                      <Icon width={16} height={16} className="text-muted-foreground" />
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        {cfg.label}s ({items.length})
                      </h2>
                    </div>
                    <ul className="space-y-3">
                      {items.map((item) => (
                        <li key={`${item.type}-${item.id}`}>
                          <Link href={item.href}>
                            <Card className="p-5 transition hover:border-primary/30 hover:shadow-md">
                              <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                  <Icon width={18} height={18} />
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <Badge tone={cfg.tone}>{cfg.label}</Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {item.meta}
                                    </span>
                                  </div>
                                  <h3 className="mt-1.5 font-semibold text-foreground">
                                    {item.title}
                                  </h3>
                                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                    {item.summary}
                                  </p>
                                </div>
                                <ArrowRightIcon
                                  width={18}
                                  height={18}
                                  className="mt-1 shrink-0 text-muted-foreground"
                                />
                              </div>
                            </Card>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!submitted && (
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-foreground">About this search</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This is a prototype static search over the published catalog index.
            In production, public search remains edge/static; authorized search
            is served by the Knowledge Service through the API gateway.
          </p>
        </Card>
      )}
    </div>
  );
}
