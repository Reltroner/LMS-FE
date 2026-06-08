import { learningPaths } from "@/catalog/paths";
import type { LearningPath } from "@/types/path";

export function getAllPaths(): readonly LearningPath[] {
  return learningPaths;
}

export function getPathBySlug(slug: string): LearningPath | undefined {
  return learningPaths.find((learningPath) => learningPath.slug === slug);
}
