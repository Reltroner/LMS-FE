import type { Course } from "../../../types/course";

export const worldbuildingOperatingSystemCourse = {
  id: "course-worldbuilding-operating-system",
  slug: "worldbuilding-operating-system",
  title: "Worldbuilding Operating System",
  subtitle: "Build organized, consistent, and sustainable fictional worlds from zero.",
  summary:
    "A structured worldbuilding course for turning raw ideas into coherent systems, canon, and a sustainable creative workflow.",
  category: "worldbuilding",
  level: "beginner",
  status: "draft",
  estimatedHours: 12,
  pathSlugs: ["worldbuilding-creator"],
  finalDeliverable: "Worldbuilding Project Starter Bible v0.1",
  authorSlug: "reltroner",
  modules: [
    {
      id: "module-wos-foundation",
      slug: "foundation",
      title: "Foundation",
      summary: "Define the project seed, creative pillars, and scope boundaries.",
      lessonSlugs: [
        "00-course-orientation",
        "01-project-seed",
        "02-creative-pillars",
        "03-scope-control",
      ],
    },
    {
      id: "module-wos-world-system",
      slug: "world-system",
      title: "World System",
      summary: "Build coherent world logic across civilization, culture, history, and place.",
      lessonSlugs: [
        "04-world-premise-and-logic",
        "05-civilization-system",
        "06-culture-system",
        "07-history-and-timeline",
        "08-geography-as-system",
      ],
    },
    {
      id: "module-wos-active-world",
      slug: "active-world",
      title: "Active World",
      summary: "Connect power, institutions, factions, and characters into story pressure.",
      lessonSlugs: ["09-factions-and-institutions", "10-character-as-product-of-world"],
    },
    {
      id: "module-wos-canon-system",
      slug: "canon-system",
      title: "Canon System",
      summary: "Organize decisions and keep continuity manageable.",
      lessonSlugs: ["11-canon-bible-system", "12-continuity-management"],
    },
    {
      id: "module-wos-sustainability",
      slug: "sustainability",
      title: "Sustainability",
      summary: "Turn the world into a repeatable creative practice and final pitch.",
      lessonSlugs: ["13-sustainable-creative-workflow", "14-final-world-pitch"],
    },
  ],
} as const satisfies Course;
