import { CourseCatalog } from "@/components/course/CourseCatalog";
import type { CourseInventory } from "@/components/course/CourseCard";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/marketing/PageHero";
import { getCourseInventory, getPublishedCourses } from "@/lib/fixtures/courses";

export const metadata = {
  title: "Courses",
  description: "Find a starting point for building connected fictional worlds. Only published courses and lessons appear here.",
};

export default function CoursesPage() {
  const courses = getPublishedCourses();
  const inventories: Record<string, CourseInventory> = Object.fromEntries(courses.map((course) => {
    const { moduleCount, plannedLessonCount, availableLessonCount } = getCourseInventory(course.slug)!;
    return [course.slug, { moduleCount, plannedLessonCount, availableLessonCount }];
  }));

  return (
    <>
      <PageHero eyebrow="Course discovery" title="Find a starting point."
        lede="Find a starting point for building connected fictional worlds. Every course listed here is published, and its lessons appear as they are written and reviewed." />
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <CourseCatalog courses={courses} inventories={inventories} />
          <aside aria-labelledby="library-heading">
            <Card tone="muted" className="p-6">
              <h2 id="library-heading" className="text-base font-semibold text-foreground">A growing library, not a padded catalog</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                A course lists its full planned syllabus, but only published lessons can be opened. Planned lessons
                are not locked or paywalled — they have not been written yet.
              </p>
            </Card>
          </aside>
        </div>
      </Container>
    </>
  );
}
