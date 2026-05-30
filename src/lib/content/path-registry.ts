import { fullStackBackendEngineerPath } from "@/content/paths/full-stack-backend-engineer";
import type { LearningPath } from "@/types/path";

const learningPaths = [fullStackBackendEngineerPath] as const satisfies readonly LearningPath[];

export function getAllPaths(): readonly LearningPath[] {
  return learningPaths;
}

export function getPathBySlug(slug: string): LearningPath | undefined {
  return learningPaths.find((learningPath) => learningPath.slug === slug);
}
