import { CourseCatalog } from "@/components/course/CourseCatalog";
import { getPublishedCourses } from "@/lib/fixtures/courses";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { BookIcon } from "@/components/ui/icons";

export const metadata = {
  title: "Course Catalog",
  description:
    "Browse published Reltroner Learning Academy courses. Only approved published content appears publicly.",
};

export default function CoursesPage() {
  const courses = getPublishedCourses();

  return (
    <>
      <Section className="pb-6 pt-10">
        <Container>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BookIcon width={22} height={22} />
            </span>
            <Badge tone="primary">Published catalog</Badge>
          </div>
          <Heading level={1} className="mt-4">
            Course Catalog
          </Heading>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Explore published courses. Draft and archived content is withheld
            from public view until approved for publication.
          </p>
        </Container>
      </Section>

      <Section className="pt-4">
        <Container>
          <CourseCatalog courses={courses} />
        </Container>
      </Section>
    </>
  );
}
