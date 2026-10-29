import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { StatusNotice } from "@/components/ui/StatusNotice";
import { ClockIcon } from "@/components/ui/icons";
import { PageHero } from "@/components/marketing/PageHero";
import { getPublishedCourses } from "@/lib/fixtures/courses";
import { getLessonsByCourseSlug } from "@/lib/fixtures/lessons";
import { lessonRoute } from "@/lib/routes/route-builders";

export const metadata = {
  title: "My Learning",
  description: "Active, completed, and saved lessons appear here once learning records are stored by a verified service.",
};

const lists = [
  { title: "Active", text: "Lessons you have started." },
  { title: "Completed", text: "Lessons you have marked as finished." },
  { title: "Saved", text: "Lessons you want to come back to." },
];

// Without authorized storage there are no records to organize, so each list says so plainly and
// the page falls back to browsing what is published.
export default function MyLearningPage() {
  const published = getPublishedCourses().flatMap((course) =>
    getLessonsByCourseSlug(course.slug).map((lesson) => ({ course, lesson })));

  return (
    <>
      <PageHero eyebrow="Personal learning" title="Your learning, at your pace."
        lede="Organize active, completed, and saved lessons — once there is a verified record to show.">
        <StatusNotice title="No learning records yet" className="mt-6">
          This site does not store learning activity yet. Browsing a lesson is not the same as completing it,
          and neither is recorded.
        </StatusNotice>
      </PageHero>

      <Container className="space-y-10">
        <ul className="grid gap-4 md:grid-cols-3" aria-label="Learning lists">
          {lists.map((list) => (
            <li key={list.title}>
              <Card className="h-full p-6">
                <h2 className="text-base font-semibold text-foreground">{list.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{list.text}</p>
                <p className="mt-4 rounded-xl bg-background-elevated px-3 py-2 text-sm text-muted-foreground">
                  Nothing recorded — not connected yet.
                </p>
              </Card>
            </li>
          ))}
        </ul>

        <section aria-labelledby="browse-heading">
          <h2 id="browse-heading" className="text-xl font-semibold text-foreground">Published lessons you can open now</h2>
          {published.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {published.map(({ course, lesson }) => (
                <li key={lesson.id}>
                  <Card className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Link href={lessonRoute(course.slug, lesson.slug)} className="font-semibold text-primary hover:underline">{lesson.title}</Link>
                      <p className="text-sm text-muted-foreground">{course.title}</p>
                    </div>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground"><ClockIcon width={14} height={14} /> {lesson.durationMinutes} min</span>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No lessons are published yet.</p>
          )}
          <ButtonLink href="/courses/" variant="secondary" className="mt-6">Browse available courses</ButtonLink>
        </section>
      </Container>
    </>
  );
}
