import type { LearningPath } from "../../types/path";

export const worldbuildingCreatorPath = {
  id: "path-worldbuilding-creator",
  slug: "worldbuilding-creator",
  title: "Worldbuilding Creator Path",
  subtitle:
    "Build a fictional world system, test it through daily life simulation, and turn it into sustainable creative output.",
  summary:
    "A creator path for building a consistent fictional world, testing it through lived simulation, and extracting reusable lore.",
  level: "beginner-to-intermediate",
  status: "draft",
  estimatedHours: 20,
  courseSlugs: ["worldbuilding-operating-system", "in-world-living-lab"],
} as const satisfies LearningPath;
