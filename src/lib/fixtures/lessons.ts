import type { Lesson } from "@/types/course";

/**
 * LESSON FIXTURES
 * ----------------------------------------------------------------------------
 * - Backend Engineering lessons reflect the actual published LMS-FE catalog
 *   (content/courses/backend-engineering/lessons). Their body text mirrors the
 *   published MDX frontmatter + prose.
 * - Worldbuilding OS & In-World Living Lab lessons are SYNTHETIC MOCK fixtures
 *   created only to demonstrate richer curriculum UI. They are marked as
 *   draft and must never appear on public/guest screens.
 * ----------------------------------------------------------------------------
 */

export const lessons: readonly Lesson[] = [
  // --- Backend Engineering Fundamentals (PUBLISHED — real catalog) ----------
  {
    id: "lesson-be-01-http-overview",
    slug: "01-http-overview",
    title: "HTTP Overview",
    summary:
      "Understand the request and response model that powers backend engineering.",
    kind: "lesson",
    status: "published",
    level: "beginner",
    durationMinutes: 15,
    objectives: [
      "Define HTTP as a client and server communication model.",
      "Identify the core parts of an HTTP request.",
      "Identify the core parts of an HTTP response.",
    ],
    outputs: [
      "HTTP request and response notes",
      "Client server interaction summary",
    ],
    tags: ["backend-engineering", "http", "fundamentals"],
    resourceIds: ["be-mdn-http-overview"],
  },
  {
    id: "lesson-be-02-http-methods",
    slug: "02-http-methods",
    title: "HTTP Methods",
    summary:
      "Use standard methods to express safe, idempotent, and mutating actions.",
    kind: "lesson",
    status: "published",
    level: "beginner",
    durationMinutes: 20,
    objectives: [
      "Distinguish safe and idempotent methods from mutating methods.",
      "Match common methods to their intended semantics.",
    ],
    outputs: ["HTTP method semantics reference"],
    tags: ["backend-engineering", "http", "methods"],
    resourceIds: ["be-mdn-http-methods"],
  },
  {
    id: "lesson-be-03-rest-introduction",
    slug: "03-rest-introduction",
    title: "REST Introduction",
    summary:
      "Introduction to resource-oriented API design with predictable HTTP behavior.",
    kind: "lesson",
    status: "published",
    level: "beginner",
    durationMinutes: 25,
    objectives: [
      "Describe REST as an architectural style.",
      "Identify resources as the nouns in an API.",
      "Connect URLs and HTTP methods to predictable API behavior.",
    ],
    outputs: ["Resource list for a small API", "REST endpoint sketch"],
    tags: ["backend-engineering", "rest", "api-design"],
  },

  // --- Worldbuilding Operating System (DRAFT — synthetic mock) --------------
  {
    id: "lesson-wb-01-creative-compound",
    slug: "01-creative-compound",
    title: "The Creative Compound Machine",
    summary:
      "Treat every creative output as an input for the next layer of work.",
    kind: "lesson",
    status: "draft",
    level: "beginner",
    durationMinutes: 20,
    objectives: [
      "Define the creative compound machine as iterative layering.",
      "Map an output from one phase to an input for the next.",
    ],
    outputs: ["Compound machine map for a personal project"],
    tags: ["worldbuilding", "methodology", "creative-system"],
  },
  {
    id: "lesson-wb-02-epistemic-modes",
    slug: "02-epistemic-modes",
    title: "Current Lore, Backstory, and Wiki Modes",
    summary:
      "Separate what is known now from what happened before and what is documented.",
    kind: "lesson",
    status: "draft",
    level: "beginner",
    durationMinutes: 25,
    objectives: [
      "Distinguish current lore from backstory and wiki modes.",
      "Apply each mode to a setting example.",
    ],
    outputs: ["Mode-classified setting notes"],
    tags: ["worldbuilding", "epistemic-modes"],
  },
  {
    id: "lesson-wb-03-progressive-disclosure",
    slug: "03-progressive-disclosure",
    title: "Progressive Disclosure",
    summary:
      "Reveal setting depth in layers so readers and players are never overwhelmed.",
    kind: "lesson",
    status: "draft",
    level: "beginner-intermediate",
    durationMinutes: 30,
    objectives: [
      "Define progressive disclosure for narrative settings.",
      "Sketch a three-tier disclosure ladder.",
    ],
    outputs: ["Disclosure ladder for a faction"],
    tags: ["worldbuilding", "narrative"],
  },

  // --- In-World Living Lab (DRAFT — synthetic mock) ------------------------
  {
    id: "lesson-iw-01-living-documents",
    slug: "01-living-documents",
    title: "Living Documents and Causal Continuity",
    summary:
      "Maintain evergreen world documents that preserve causal continuity.",
    kind: "lesson",
    status: "draft",
    level: "intermediate",
    durationMinutes: 35,
    objectives: [
      "Define causal continuity across setting changes.",
      "Version a living document without losing prior consequences.",
    ],
    outputs: ["Versioned living document sample"],
    tags: ["worldbuilding", "living-lab"],
  },
  {
    id: "lesson-iw-02-simulation-checkpoint",
    slug: "02-simulation-checkpoint",
    title: "Simulation Checkpoint",
    summary:
      "Run a small in-world simulation and capture its consequences as canon.",
    kind: "checkpoint",
    status: "draft",
    level: "intermediate",
    durationMinutes: 45,
    objectives: [
      "Run a bounded simulation against a setting.",
      "Record outcomes as retrievable canon entries.",
    ],
    outputs: ["Simulation outcome log"],
    tags: ["worldbuilding", "simulation", "checkpoint"],
  },
] as const;

export function getLessonsByCourseSlug(courseSlug: string): readonly Lesson[] {
  const map: Record<string, string[]> = {
    "backend-engineering": [
      "01-http-overview",
      "02-http-methods",
      "03-rest-introduction",
    ],
    "worldbuilding-operating-system": [
      "01-creative-compound",
      "02-epistemic-modes",
      "03-progressive-disclosure",
    ],
    "in-world-living-lab": ["01-living-documents", "02-simulation-checkpoint"],
  };
  const slugs = map[courseSlug] ?? [];
  return slugs
    .map((slug) => lessons.find((l) => l.slug === slug))
    .filter((l): l is Lesson => Boolean(l));
}

export function getLessonBySlug(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}
