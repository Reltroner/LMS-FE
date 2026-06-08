import type { LearningPath } from "../../types/path";

export const fullStackBackendEngineerPath = {
  id: "path-full-stack-backend-engineer",
  slug: "full-stack-backend-engineer",
  title: "Full Stack Backend Engineer",
  subtitle: "A course-as-code learning path for building backend engineering foundations.",
  summary:
    "Build backend foundations through a static course sequence that starts with HTTP and REST API design.",
  level: "beginner",
  status: "published",
  estimatedHours: 20,
  courseSlugs: ["backend-engineering"],
} as const satisfies LearningPath;
