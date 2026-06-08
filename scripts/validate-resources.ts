import { courses } from "../src/catalog/courses";
import { resources } from "../src/catalog/resources";
import type { Resource } from "../src/types/resource";
import { duplicateValues, readLessonFiles, reportValidationResult } from "./_content-utils";

const errors: string[] = [];
const courseSlugs = new Set<string>(courses.map((course) => course.slug));
const allResources = resources as readonly Resource[];
const resourceIds = allResources.map((resource) => resource.id);
const resourceIdSet = new Set<string>(resourceIds);

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isPinnedJsDelivrUrl(url: string) {
  if (!url.startsWith("https://cdn.jsdelivr.net/gh/")) {
    return true;
  }

  const match = url.match(/\/gh\/[^/]+\/[^/@]+@([^/]+)/);
  const version = match?.[1];

  return version ? !["main", "master", "latest"].includes(version) : false;
}

for (const duplicateResourceId of duplicateValues(resourceIds)) {
  errors.push(`Duplicate resource id: ${duplicateResourceId}`);
}

for (const resource of allResources) {
  if (!courseSlugs.has(resource.courseSlug)) {
    errors.push(`Resource ${resource.id} references missing course ${resource.courseSlug}.`);
  }

  if (!isValidUrl(resource.url)) {
    errors.push(`Resource ${resource.id} has an invalid URL.`);
  }

  if (!isPinnedJsDelivrUrl(resource.url)) {
    errors.push(`Resource ${resource.id} uses an unpinned jsDelivr URL.`);
  }

  if (resource.type === "image" && !resource.alt) {
    errors.push(`Image resource ${resource.id} must include alt text.`);
  }
}

for (const lesson of readLessonFiles()) {
  const resourceIdsInLesson = lesson.frontmatter.resourceIds;

  if (!Array.isArray(resourceIdsInLesson)) {
    continue;
  }

  for (const resourceId of resourceIdsInLesson) {
    if (!resourceIdSet.has(resourceId)) {
      errors.push(`${lesson.relativePath} references missing resource ${resourceId}.`);
    }
  }
}

reportValidationResult("Resource validation", errors);
