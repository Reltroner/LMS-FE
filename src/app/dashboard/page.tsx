import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { StatusNotice } from "@/components/ui/StatusNotice";
import { ArrowRightIcon, CompassIcon, SearchIcon, SparklesIcon } from "@/components/ui/icons";
import { PageHero } from "@/components/marketing/PageHero";
import { getCourseInventory, getPublishedCourses } from "@/lib/fixtures/courses";
import { getPublishedPaths } from "@/lib/fixtures/paths";
import { lessonRoute, pathRoute } from "@/lib/routes/route-builders";

export const metadata = {
  title: "Learner home",
  description: "Re-enter your learning: the available lesson, the learning path, and search. Progress tracking is not connected yet.",
};

// No learner data exists on this site, so nothing personal is shown: no name, no progress, no
// achievements. The page points to what is genuinely available.
export default function DashboardPage() {
  const course = getPublishedCourses()[0];
  const first = course && getCourseInventory(course.slug)?.firstLesson;
  const path = getPublishedPaths()[0];

  return (
    <>
      <PageHero eyebrow="Learner home" title="Welcome to your creative practice."
        lede="Pick up with what is published, or discover what to explore next.">
        <StatusNotice title="Personal progress is not connected yet" className="mt-6">
          Sign-in and progress saving are not available, so this page shows no personal data, history, or
          achievements. Reading a lesson is never recorded as completing it.
        </StatusNotice>
      </PageHero>

      <Container>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="flex flex-col p-6">
            <h2 className="text-base font-semibold text-foreground">Start here</h2>
            {course && first ? (
              <>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {course.title} · {first.title} · about {first.durationMinutes} min
                </p>
                <ButtonLink href={lessonRoute(course.slug, first.slug)} className="mt-auto w-fit" size="sm">
                  Open the lesson <ArrowRightIcon width={14} height={14} />
                </ButtonLink>
              </>
            ) : (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">No lesson is published yet.</p>
            )}
          </Card>
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground">Saved lessons</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Not available yet — there is nowhere to save them. Bookmark lessons in your browser for now.
            </p>
          </Card>
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground">Learning snapshot</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Progress will appear here only once it is saved by a verified service. Until then, nothing is tracked.
            </p>
          </Card>
        </div>

        <ul className="mt-8 flex flex-wrap gap-3">
          {path && (
            <li>
              <Link href={pathRoute(path.slug)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground hover:text-primary">
                <CompassIcon width={16} height={16} /> {path.title} path
              </Link>
            </li>
          )}
          <li>
            <Link href="/search/" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground hover:text-primary">
              <SearchIcon width={16} height={16} /> Search the academy
            </Link>
          </li>
          <li>
            <Link href="/ai/" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground hover:text-primary">
              <SparklesIcon width={16} height={16} /> Ask the AI Guide
            </Link>
          </li>
        </ul>
      </Container>
    </>
  );
}
