import { SearchPage } from "@/components/search/SearchPage";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { SearchIcon } from "@/components/ui/icons";

export const metadata = {
  title: "Search",
  description:
    "Search published courses, learning paths, and lessons across the academy.",
};

export default function SearchRoute() {
  return (
    <Section className="pb-16 pt-10 sm:pb-20 sm:pt-12">
      <Container>
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <SearchIcon width={22} height={22} />
            </span>
            <Badge tone="primary">Static search</Badge>
          </div>
          <Heading level={1} className="mt-4">
            Search the academy
          </Heading>
          <p className="mt-3 text-lg text-muted-foreground">
            Find published courses, learning paths, and lessons. Search runs
            locally against the static catalog index.
          </p>
        </div>

        <div className="mt-7 sm:mt-8">
          <SearchPage />
        </div>
      </Container>
    </Section>
  );
}
