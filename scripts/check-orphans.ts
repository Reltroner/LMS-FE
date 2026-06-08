import { courses } from "../src/catalog/courses";
import { readLessonFiles, reportValidationResult } from "./_content-utils";

const errors: string[] = [];
const lessonFiles = readLessonFiles();
const lessonFileKeys = new Set(
  lessonFiles.map((lesson) => `${lesson.courseSlug}/${lesson.lessonSlug}`),
);
const referenceCounts = new Map<string, number>();

for (const course of courses) {
  for (const courseModule of course.modules) {
    for (const lessonSlug of courseModule.lessonSlugs) {
      const key = `${course.slug}/${lessonSlug}`;

      referenceCounts.set(key, (referenceCounts.get(key) ?? 0) + 1);

      if (!lessonFileKeys.has(key)) {
        errors.push(`Course ${course.slug} module ${courseModule.slug} references missing ${key}.`);
      }
    }
  }
}

for (const lesson of lessonFiles) {
  const key = `${lesson.courseSlug}/${lesson.lessonSlug}`;
  const count = referenceCounts.get(key) ?? 0;

  if (count !== 1) {
    errors.push(`${lesson.relativePath} is referenced ${count} time(s); expected exactly 1.`);
  }
}

reportValidationResult("Orphan validation", errors);
