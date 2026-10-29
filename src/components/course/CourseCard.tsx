import Link from "next/link";
import type { Course } from "@/types/course";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowRightIcon } from "@/components/ui/icons";
import { ConceptImage } from "@/components/marketing/ConceptImage";
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

export function CourseCard({ course, inventory }: { course: Course; inventory: CourseInventory }) {
  const cover = courseCoverSlots[course.slug];
  const { availableLessonCount: available, moduleCount: modules } = inventory;
  return (
    <Card as="article" interactive className="flex flex-col overflow-hidden">
      {cover && <ConceptImage slot={cover} framed={false} />}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="primary">{categoryLabels[course.category]}</Badge>
          <Badge tone="neutral">{levelLabels[course.level]}</Badge>
        </div>
        <h3 className="mt-3 text-xl font-semibold text-foreground">
          <Link href={courseRoute(course.slug)} className="hover:text-primary">{course.title}</Link>
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{course.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <AvailabilityBadge available={available > 0} label={`${available} ${available === 1 ? "lesson" : "lessons"} available`} />
          <AvailabilityBadge available={false} label={`${modules}-module planned curriculum`} />
        </div>
        <div className="mt-auto pt-5">
          <Link href={courseRoute(course.slug)} aria-label={`Explore ${course.title}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            Explore course <ArrowRightIcon width={14} height={14} />
          </Link>
        </div>
      </div>
    </Card>
  );
}
