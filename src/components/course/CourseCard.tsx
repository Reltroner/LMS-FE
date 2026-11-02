import Link from "next/link";
import type { Course } from "@/types/course";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ConceptImage } from "@/components/marketing/ConceptImage";
import { cn } from "@/lib/utils/cn";
import { courseCoverSlots } from "@/lib/media/image-slots";
import { courseRoute } from "@/lib/routes/route-builders";
import { AvailabilityBadge } from "./AvailabilityBadge";

export type CourseInventory = Readonly<{ moduleCount: number; plannedLessonCount: number; availableLessonCount: number }>;

export const categoryLabels: Record<string, string> = {
  worldbuilding: "Worldbuilding",
  "creative-system": "Creative System",
};

export const levelLabels: Record<string, string> = {
  beginner: "Beginner",
  "beginner-intermediate": "Beginner → Intermediate",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

// "stack" sits in a grid of courses (cover across the top); "row" presents a course on its own,
// cover beside the text from md up, so a single course does not leave an empty grid column.
export function CourseCard({ course, inventory, layout = "stack" }: {
  course: Course; inventory: CourseInventory; layout?: "stack" | "row";
}) {
  const cover = courseCoverSlots[course.slug];
  const row = layout === "row";
  const { availableLessonCount: available, moduleCount: modules } = inventory;
  return (
    <Card as="article" interactive
      className={row ? "grid gap-2 p-3 sm:p-4 md:grid-cols-2 md:items-center md:gap-4" : "flex flex-col overflow-hidden"}>
      {cover && <ConceptImage slot={cover} framed={false} className={row ? "rounded-2xl" : undefined} />}
      <div className={cn("flex flex-1 flex-col", row ? "p-3 md:py-4 md:pr-4" : "p-6")}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="primary">{categoryLabels[course.category]}</Badge>
          <Badge tone="neutral">{levelLabels[course.level]}</Badge>
        </div>
        <h2 className="mt-3 text-xl font-semibold text-foreground">
          <Link href={courseRoute(course.slug)} className="hover:text-primary">{course.title}</Link>
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{course.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <AvailabilityBadge available={available > 0} label={`${available} ${available === 1 ? "lesson" : "lessons"} available`} />
          <AvailabilityBadge available={false} label={`${modules}-module planned curriculum`} />
        </div>
        <div className="mt-auto pt-5">
          <Link href={courseRoute(course.slug)} aria-label={`Explore ${course.title}`}
            className="inline-flex min-h-6 items-center text-sm font-semibold text-primary underline-offset-2 hover:underline">
            Explore course
          </Link>
        </div>
      </div>
    </Card>
  );
}
