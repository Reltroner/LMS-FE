import { Suspense } from "react";
import { SearchPage, SearchPageFromUrl } from "@/components/search/SearchPage";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/marketing/PageHero";

export const metadata = {
  title: "Search",
  description: "Search published lessons, courses, and learning paths, and read the original passages.",
};

export default function SearchRoute() {
  return (
    <>
      <PageHero eyebrow="Knowledge discovery" title="Search the academy."
        lede="Find a published lesson, a definition, or the original passage behind a learning concept. Results use the same index as quick search (Ctrl K) and the AI Guide." />
      <Container size="md">
        {/* The prerendered page shows the empty search; a ?q= query fills in on the client. */}
        <Suspense fallback={<SearchPage />}>
          <SearchPageFromUrl />
        </Suspense>
      </Container>
    </>
  );
}
