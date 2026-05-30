import type { LearningPath } from "@/types/path";

export const fullStackBackendEngineerPath = {
  id: "path-full-stack-backend-engineer",
  slug: "full-stack-backend-engineer",
  title: "Full Stack Backend Engineer",
  description: "A course-as-code learning path for building backend engineering foundations.",
  level: "Beginner",
  estimatedHours: 20,
  courseSlugs: ["backend-engineering-fundamentals"],
} as const satisfies LearningPath;
