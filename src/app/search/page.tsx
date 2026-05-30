import { Suspense } from "react";

import { JsonLd } from "@/components/seo/JsonLd";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchResults } from "@/components/search/SearchResults";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { getSearchIndex, type SearchItem } from "@/lib/content/search-index";
import { createMetadata } from "@/lib/seo/metadata";
import { createWebPageStructuredData } from "@/lib/seo/structured-data";

export const metadata = createMetadata({
  title: "Search",
  description: "Search courses and lessons across Reltroner Learning Academy.",
  path: "/search",
});

export default function SearchPage() {
  const items = getSearchIndex();

  return (
    <>
      <JsonLd
        id="search-webpage-jsonld"
        data={createWebPageStructuredData({
          name: "Search",
          description: "Search courses and lessons across Reltroner Learning Academy.",
          path: "/search",
        })}
      />
      <Section className="py-10 sm:py-14 lg:py-16">
        <Container>
          <div className="space-y-8 lg:space-y-10">
            <section
              aria-labelledby="search-hero-title"
              className="overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-[radial-gradient(circle_at_top_left,rgba(244,244,245,0.95),rgba(255,255,255,1)_40%,rgba(250,250,250,1)_72%)] p-8 shadow-[0_32px_90px_-56px_rgba(24,24,27,0.45)] sm:p-10 lg:p-12"
            >
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Search System
                </p>
                <Heading level={1} className="max-w-3xl text-balance sm:text-6xl">
                  Search
                </Heading>
                <p className="max-w-2xl text-lg leading-8 text-zinc-600 sm:text-xl">
                  Search courses and lessons from a single lightweight frontend-only index.
                </p>
              </div>
            </section>
            <Suspense fallback={<SearchResultsFallback items={items} />}>
              <SearchResults items={items} />
            </Suspense>
          </div>
        </Container>
      </Section>
    </>
  );
}

type SearchResultsFallbackProps = {
  items: readonly SearchItem[];
};

function SearchResultsFallback({ items }: SearchResultsFallbackProps) {
  return (
    <div className="space-y-6">
      <SearchInput query="" disabled />
      <section className="space-y-4 rounded-4xl border border-zinc-200 bg-white p-6 shadow-[0_24px_70px_-56px_rgba(24,24,27,0.25)] sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Unified search index
          </p>
          <h2 className="text-2xl font-semibold tracking-normal text-zinc-950">
            Preparing searchable content
          </h2>
        </div>
        <p className="text-sm text-zinc-500">Indexing {items.length} searchable items.</p>
      </section>
    </div>
  );
}
