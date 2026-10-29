import type { LearningPath } from "@/types/path";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowRightIcon } from "@/components/ui/icons";
import { ConceptImage } from "@/components/marketing/ConceptImage";
import { AvailabilityBadge } from "@/components/course/AvailabilityBadge";
import { ModuleRoadmap } from "@/components/course/ModuleRoadmap";
import { getCourseBySlug, getCourseInventory } from "@/lib/fixtures/courses";
import { pathCoverSlots } from "@/lib/media/image-slots";
import { lessonRoute, pathRoute } from "@/lib/routes/route-builders";

// A featured learning path: its courses' real module sequence with per-stage availability.
export function PathCard({ path }: { path: LearningPath }) {
  const courses = path.courseSlugs.map((slug) => getCourseBySlug(slug)).filter((c) => c !== undefined);
  const inventories = courses.map((course) => getCourseInventory(course.slug)!);
  const available = inventories.reduce((n, i) => n + i.availableLessonCount, 0);
  const modules = inventories.reduce((n, i) => n + i.moduleCount, 0);
  const first = inventories.find((i) => i.firstLesson);
  const firstCourse = courses[inventories.indexOf(first!)];
  const cover = courses.map((course) => pathCoverSlots[course.slug]).find((slot) => slot !== undefined) ?? "PATH_WOS_JOURNEY";

  return (
    <Card as="article" className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="min-w-0">
        <ConceptImage slot={cover} />
        <p className="eyebrow mt-6">Learning path</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">{path.title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{path.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <AvailabilityBadge available={available > 0} label={`${available} published ${available === 1 ? "lesson" : "lessons"}`} />
          <AvailabilityBadge available={false} label={`${modules} planned modules`} />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href={pathRoute(path.slug)}>
            Explore learning path <ArrowRightIcon width={16} height={16} />
          </ButtonLink>
          {first?.firstLesson && firstCourse && (
            <ButtonLink href={lessonRoute(firstCourse.slug, first.firstLesson.slug)} variant="secondary">
              Start the first lesson
            </ButtonLink>
          )}
        </div>
      </div>
      <div className="min-w-0">
        {courses.map((course) => (
          <div key={course.id}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Stages · {course.title}</h3>
            <ModuleRoadmap course={course} compact />
          </div>
        ))}
      </div>
    </Card>
  );
}
