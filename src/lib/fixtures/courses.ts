import type { Course } from "@/types/course";

/**
 * COURSE FIXTURES
 * ----------------------------------------------------------------------------
 * - "Backend Engineering Fundamentals" is the ACTUAL published course from the
 *   LMS-FE catalog (src/catalog/courses/backend-engineering/course.ts).
 * - "Worldbuilding Operating System" and "In-World Living Lab" are recorded as
 *   DRAFT in the real catalog. They are included here as draft fixtures for
 *   authenticated/instructor/admin contexts only. They MUST NOT render on
 *   public/guest screens.
 * - "API Design Patterns" and "Deployment & Operations" are SYNTHETIC MOCK
 *   courses added to demonstrate richer catalog UI. They are clearly marked as
 *   mock and are not part of the real LMS catalog.
 * ----------------------------------------------------------------------------
 */

export const courses: readonly Course[] = [
  {
    id: "course-backend-engineering",
    slug: "backend-engineering",
    aliases: ["backend-engineering-fundamentals"],
    title: "Backend Engineering Fundamentals",
    subtitle:
      "Learn backend engineering fundamentals including HTTP, REST APIs, authentication, databases and deployment concepts.",
    summary:
      "A course-as-code backend foundation covering HTTP, REST APIs, and the concepts behind production backend systems.",
    category: "backend-engineering",
    level: "beginner",
    status: "published",
    isSynthetic: false,
    estimatedHours: 20,
    pathSlugs: ["full-stack-backend-engineer"],
    finalDeliverable: "Backend Engineering Foundations Notes",
    authorSlug: "reltroner",
    objectives: [
      "Explain the HTTP request and response model.",
      "Use standard HTTP methods with correct semantics.",
      "Design resource-oriented REST API contracts.",
      "Recognize the concepts behind production backend systems.",
    ],
    modules: [
      {
        id: "module-http-fundamentals",
        slug: "http-fundamentals",
        title: "HTTP Fundamentals",
        summary:
          "Understand the request and response model that powers the web.",
        lessonSlugs: ["01-http-overview", "02-http-methods"],
      },
      {
        id: "module-rest-apis",
        slug: "rest-apis",
        title: "REST APIs",
        summary:
          "Design resource-oriented API contracts with predictable behavior.",
        lessonSlugs: ["03-rest-introduction"],
      },
    ],
  },
  {
    id: "course-worldbuilding-operating-system",
    slug: "worldbuilding-operating-system",
    title: "Worldbuilding Operating System",
    subtitle:
      "A methodology for building durable, progressive, and causally coherent fictional settings.",
    summary:
      "Learn the creative compound machine, epistemic modes, and progressive disclosure that make a setting feel alive.",
    category: "worldbuilding",
    level: "beginner",
    status: "draft",
    estimatedHours: 40,
    pathSlugs: ["worldbuilding-creator"],
    finalDeliverable: "Worldbuilding System Notebook",
    authorSlug: "reltroner",
    modules: [
      {
        id: "module-wb-foundations",
        slug: "foundations",
        title: "Creative Foundations",
        summary: "Core methodology for layered creative work.",
        lessonSlugs: ["01-creative-compound", "02-epistemic-modes"],
      },
      {
        id: "module-wb-disclosure",
        slug: "disclosure",
        title: "Progressive Disclosure",
        summary: "Reveal depth in calibrated layers.",
        lessonSlugs: ["03-progressive-disclosure"],
      },
    ],
  },
  {
    id: "course-in-world-living-lab",
    slug: "in-world-living-lab",
    title: "In-World Living Lab",
    subtitle:
      "Run living simulations and maintain evergreen world documents with causal continuity.",
    summary:
      "Apply the worldbuilding operating system inside a living lab where consequences compound over time.",
    category: "worldbuilding",
    level: "intermediate",
    status: "draft",
    estimatedHours: 30,
    pathSlugs: ["worldbuilding-creator"],
    prerequisiteCourseSlugs: ["worldbuilding-operating-system"],
    finalDeliverable: "Living World Simulation Log",
    authorSlug: "reltroner",
    modules: [
      {
        id: "module-iw-living",
        slug: "living-documents",
        title: "Living Documents",
        summary: "Maintain evergreen setting records.",
        lessonSlugs: ["01-living-documents"],
      },
      {
        id: "module-iw-simulation",
        slug: "simulation",
        title: "Simulation Practice",
        summary: "Run and record bounded simulations.",
        lessonSlugs: ["02-simulation-checkpoint"],
      },
    ],
  },
  {
    id: "course-api-design-patterns",
    slug: "api-design-patterns",
    title: "API Design Patterns",
    subtitle:
      "Move beyond REST basics into versioning, pagination, idempotency, and contract-first design.",
    summary:
      "A synthetic mock course demonstrating catalog richness. Not part of the published LMS catalog.",
    category: "backend-engineering",
    level: "intermediate",
    status: "published",
    isSynthetic: true,
    estimatedHours: 28,
    pathSlugs: ["full-stack-backend-engineer"],
    finalDeliverable: "API Contract Portfolio",
    authorSlug: "reltroner",
    modules: [
      {
        id: "module-api-patterns",
        slug: "patterns",
        title: "Core Patterns",
        summary: "Versioning, pagination, and idempotency.",
        lessonSlugs: [],
      },
    ],
  },
  {
    id: "course-deployment-operations",
    slug: "deployment-and-operations",
    title: "Deployment & Operations",
    subtitle:
      "From build to release: static delivery, observability, and safe rollouts.",
    summary:
      "A synthetic mock course demonstrating catalog richness. Not part of the published LMS catalog.",
    category: "backend-engineering",
    level: "beginner-intermediate",
    status: "published",
    isSynthetic: true,
    estimatedHours: 24,
    pathSlugs: ["full-stack-backend-engineer"],
    finalDeliverable: "Release Runbook",
    authorSlug: "reltroner",
    modules: [
      {
        id: "module-deploy",
        slug: "delivery",
        title: "Delivery & Observability",
        summary: "Ship and observe backend systems safely.",
        lessonSlugs: [],
      },
    ],
  },
] as const;

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find(
    (c) => c.slug === slug || c.aliases?.includes(slug),
  );
}

export function getPublishedCourses(): readonly Course[] {
  return courses.filter((c) => c.status === "published" && c.isSynthetic !== true);
}

export function getAllCourses(): readonly Course[] {
  return courses;
}
