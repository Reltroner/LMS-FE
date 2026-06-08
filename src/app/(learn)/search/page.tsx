import { Suspense } from "react";

import { JsonLd } from "@/components/seo/JsonLd";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchResults } from "@/components/search/SearchResults";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { getSearchIndex, type SearchItem } from "@/lib/content/search-index";
import { createMetadata } from "@/lib/seo/metadata";
import { createWebPageStructuredData } from "@/lib/seo/structured-data";

export const metadata = createMetadata({
  title: "Search",
  description: "Search courses, lessons, and paths across Reltroner Learning Academy.",
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
          description: "Search courses, lessons, and paths across Reltroner Learning Academy.",
          path: "/search",
        })}
      />
      <Section className="py-10 sm:py-14 lg:py-16">
        <Container>
          <div className="space-y-8 lg:space-y-10">
            <section
              aria-labelledby="search-hero-title"
              className="overflow-hidden rounded-[2rem] border border-border bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_38%),linear-gradient(135deg,#ffffff,#f8fbff)] p-6 shadow-[0_30px_90px_-62px_rgba(15,23,42,0.55)] sm:p-8 lg:p-10"
            >
              <div className="space-y-4">
                <Badge tone="primary">Search System</Badge>
                <Heading level={1} className="max-w-3xl text-balance sm:text-6xl">
                  Search
                </Heading>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                  Search courses, lessons, and paths from a single lightweight frontend-only index.
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
      <section className="space-y-4 rounded-4xl border border-border bg-card p-6 shadow-[0_24px_70px_-56px_rgba(15,23,42,0.28)] sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Unified search index
          </p>
          <h2 className="text-2xl font-semibold tracking-normal text-foreground">
            Preparing searchable content
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">Indexing {items.length} searchable items.</p>
      </section>
    </div>
  );
}
