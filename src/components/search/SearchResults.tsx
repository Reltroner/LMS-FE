"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useTransition } from "react";

import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { SearchInput } from "@/components/search/SearchInput";
import type { SearchItem } from "@/lib/content/search-index";

type SearchResultsProps = {
  items: readonly SearchItem[];
};

function compareByTypeThenTitle(leftItem: SearchItem, rightItem: SearchItem) {
  if (leftItem.type !== rightItem.type) {
    return leftItem.type === "course" ? -1 : 1;
  }

  return leftItem.title.localeCompare(rightItem.title);
}

function getVisibleResults(items: readonly SearchItem[], query: string): SearchItem[] {
  const orderedItems = [...items].sort(compareByTypeThenTitle);

  if (!query) {
    return orderedItems;
  }

  return orderedItems
    .filter((item) => {
      const title = item.title.toLowerCase();
      const description = item.description.toLowerCase();

      return title.includes(query) || description.includes(query);
    })
    .sort((leftItem, rightItem) => {
      const leftTitleMatch = leftItem.title.toLowerCase().includes(query);
      const rightTitleMatch = rightItem.title.toLowerCase().includes(query);

      if (leftTitleMatch !== rightTitleMatch) {
        return leftTitleMatch ? -1 : 1;
      }

      return compareByTypeThenTitle(leftItem, rightItem);
    });
}

export function SearchResults({ items }: SearchResultsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const rawQuery = searchParams.get("q") ?? "";
  const normalizedQuery = rawQuery.trim().toLowerCase();
  const deferredQuery = useDeferredValue(normalizedQuery);
  const visibleResults = getVisibleResults(items, deferredQuery);
  const resultLabel = visibleResults.length === 1 ? "result" : "results";

  function handleQueryChange(nextQuery: string) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    const trimmedQuery = nextQuery.trim();

    if (trimmedQuery) {
      nextSearchParams.set("q", nextQuery);
    } else {
      nextSearchParams.delete("q");
    }

    const queryString = nextSearchParams.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }

  return (
    <div className="space-y-6">
      <SearchInput query={rawQuery} isPending={isPending} onQueryChange={handleQueryChange} />
      <section
        aria-labelledby="search-results-title"
        className="space-y-6 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_24px_70px_-56px_rgba(24,24,27,0.25)] sm:p-8"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Unified search index
            </p>
            <h2
              id="search-results-title"
              className="text-2xl font-semibold tracking-normal text-zinc-950"
            >
              {normalizedQuery ? "Search results" : "Browse searchable content"}
            </h2>
          </div>
          <p aria-live="polite" className="text-sm text-zinc-500">
            {normalizedQuery
              ? `Showing ${visibleResults.length} ${resultLabel} for “${rawQuery.trim()}”.`
              : `Showing ${visibleResults.length} searchable items.`}
          </p>
        </div>
        {visibleResults.length > 0 ? (
          <ol className="space-y-4">
            {visibleResults.map((item) => (
              <li key={item.id}>
                <article className="rounded-[1.75rem] border border-zinc-200 bg-zinc-50/80 p-5 shadow-[0_24px_70px_-60px_rgba(24,24,27,0.2)] sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <span className="inline-flex w-fit items-center rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                      {item.type}
                    </span>
                    <p className="text-sm text-zinc-500">{item.url}</p>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-normal text-zinc-950">
                    <Link
                      href={item.url}
                      className="rounded-sm transition hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
                    >
                      {item.title}
                    </Link>
                  </h3>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600">
                    {item.description}
                  </p>
                  <Link
                    href={item.url}
                    className="mt-5 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-zinc-950 transition hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
                  >
                    Open result
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </article>
              </li>
            ))}
          </ol>
        ) : (
          <SearchEmptyState />
        )}
      </section>
    </div>
  );
}
