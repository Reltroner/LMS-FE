import type { Course } from "../../../types/course";

export const inWorldLivingLabCourse = {
  id: "course-in-world-living-lab",
  slug: "in-world-living-lab",
  title: "In-World Living Lab",
  subtitle: "Live one realistic day inside your fictional world and extract lore from experience.",
  summary:
    "A simulation-based course for testing a fictional world through daily life, journaling, and lore extraction.",
  category: "worldbuilding",
  level: "beginner-intermediate",
  status: "draft",
  estimatedHours: 8,
  pathSlugs: ["worldbuilding-creator"],
  prerequisiteCourseSlugs: ["worldbuilding-operating-system"],
  finalDeliverable: "In-World Life Journal v0.1",
  authorSlug: "reltroner",
  modules: [
    {
      id: "module-iwll-setup",
      slug: "setup",
      title: "Setup",
      summary: "Prepare the persona, zone, and routine for a bounded simulation.",
      lessonSlugs: [
        "00-course-orientation",
        "01-in-world-persona",
        "02-simulation-zone",
        "03-daily-routine-system",
      ],
    },
    {
      id: "module-iwll-realistic-living",
      slug: "realistic-living",
      title: "Realistic Living",
      summary:
        "Test daily life through constraints, social contact, economy, risk, and sensory detail.",
      lessonSlugs: [
        "04-constraint-based-living",
        "05-in-world-journaling-method",
        "06-social-interaction-simulation",
        "07-economy-of-daily-life",
        "08-law-risk-and-consequence",
        "09-sensory-worldbuilding",
      ],
    },
    {
      id: "module-iwll-extraction",
      slug: "extraction",
      title: "Extraction",
      summary: "Turn journal evidence into lore, visual direction, and a final life journal.",
      lessonSlugs: [
        "10-journal-to-lore-extraction",
        "11-journal-to-artwork-pipeline",
        "12-final-in-world-life-journal",
      ],
    },
  ],
} as const satisfies Course;
