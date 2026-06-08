import { resources } from "@/catalog/resources";
import type { Resource } from "@/types/resource";

export const resourceById = Object.fromEntries(
  resources.map((resource) => [resource.id, resource]),
) as Record<string, Resource | undefined>;

export function getAllResources(): readonly Resource[] {
  return resources;
}

export function getResourceById(resourceId: string): Resource | undefined {
  return resourceById[resourceId];
}

export function getResourcesByCourseSlug(courseSlug: string): readonly Resource[] {
  return resources.filter((resource) => resource.courseSlug === courseSlug);
}
