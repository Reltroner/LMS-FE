import type { LearningPath } from "@/types/path";

/**
 * LEARNING PATH FIXTURES
 * ----------------------------------------------------------------------------
 * - "Full Stack Backend Engineer" is the ACTUAL published path from LMS-FE.
 * - "Worldbuilding Creator Path" is recorded as DRAFT in the real catalog.
 * ----------------------------------------------------------------------------
 */

export const paths: readonly LearningPath[] = [
  {
    id: "path-full-stack-backend-engineer",
    slug: "full-stack-backend-engineer",
    title: "Full Stack Backend Engineer",
    subtitle:
      "A course-as-code learning path for building backend engineering foundations.",
    summary:
      "Build backend foundations through a static course sequence that starts with HTTP and REST API design.",
    level: "beginner",
    status: "published",
    estimatedHours: 72,
    courseSlugs: ["backend-engineering"],
  },
  {
    id: "path-worldbuilding-creator",
    slug: "worldbuilding-creator",
    title: "Worldbuilding Creator Path",
    subtitle:
      "From methodology to living lab — build and maintain causally coherent settings.",
    summary:
      "Learn the worldbuilding operating system, then apply it inside a living lab where consequences compound.",
    level: "beginner-to-intermediate",
    status: "draft",
    estimatedHours: 70,
    courseSlugs: ["worldbuilding-operating-system", "in-world-living-lab"],
  },
] as const;

export function getPathBySlug(slug: string): LearningPath | undefined {
  return paths.find((p) => p.slug === slug);
}

export function getPublishedPaths(): readonly LearningPath[] {
  return paths.filter((p) => p.status === "published");
}

export function getAllPaths(): readonly LearningPath[] {
  return paths;
}
