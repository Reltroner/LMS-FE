import { z } from "zod";

import { courses } from "../src/catalog/courses";
import { learningPaths } from "../src/catalog/paths";
import type { Course } from "../src/types/course";
import type { LearningPath } from "../src/types/path";
import { duplicateValues, readLessonFiles, reportValidationResult } from "./_content-utils";

const lessonFrontmatterSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  kind: z.enum(["lesson", "lab", "checkpoint", "capstone"]),
  status: z.enum(["draft", "published", "archived"]),
  level: z.enum(["beginner", "beginner-intermediate", "intermediate", "advanced"]),
  durationMinutes: z.number().positive(),
  objectives: z.array(z.string().min(1)).nonempty(),
  outputs: z.array(z.string().min(1)).nonempty(),
  tags: z.array(z.string().min(1)).nonempty(),
  resourceIds: z.array(z.string().min(1)).optional(),
});

const errors: string[] = [];
const allCourses = courses as readonly Course[];
const allPaths = learningPaths as readonly LearningPath[];
const lessonFiles = readLessonFiles();
const lessonKeys = new Set(
  lessonFiles.map((lesson) => `${lesson.courseSlug}/${lesson.lessonSlug}`),
);
const courseSlugs = allCourses.map((course) => course.slug);
const courseSlugSet = new Set<string>(courseSlugs);
const pathSlugs = allPaths.map((path) => path.slug);
const pathSlugSet = new Set<string>(pathSlugs);

for (const duplicateSlug of duplicateValues(courseSlugs)) {
  errors.push(`Duplicate course slug: ${duplicateSlug}`);
}

for (const duplicateSlug of duplicateValues(pathSlugs)) {
  errors.push(`Duplicate path slug: ${duplicateSlug}`);
}

for (const course of allCourses) {
  if (course.modules.length === 0) {
    errors.push(`Course ${course.slug} must have at least one module.`);
  }

  for (const pathSlug of course.pathSlugs) {
    if (!pathSlugSet.has(pathSlug)) {
      errors.push(`Course ${course.slug} references missing path ${pathSlug}.`);
    }
  }

  for (const prerequisiteCourseSlug of course.prerequisiteCourseSlugs ?? []) {
    if (!courseSlugSet.has(prerequisiteCourseSlug)) {
      errors.push(
        `Course ${course.slug} references missing prerequisite ${prerequisiteCourseSlug}.`,
      );
    }
  }

  const courseLessonSlugs = course.modules.flatMap((courseModule) => courseModule.lessonSlugs);

  for (const duplicateLessonSlug of duplicateValues(courseLessonSlugs)) {
    errors.push(`Course ${course.slug} references duplicate lesson ${duplicateLessonSlug}.`);
  }

  for (const courseModule of course.modules) {
    if (courseModule.lessonSlugs.length === 0) {
      errors.push(`Course ${course.slug} module ${courseModule.slug} has no lessons.`);
    }

    for (const lessonSlug of courseModule.lessonSlugs) {
      if (!lessonKeys.has(`${course.slug}/${lessonSlug}`)) {
        errors.push(`Course ${course.slug} references missing lesson ${lessonSlug}.`);
      }
    }
  }
}

for (const path of allPaths) {
  if (path.courseSlugs.length === 0) {
    errors.push(`Path ${path.slug} must include at least one course.`);
  }

  for (const courseSlug of path.courseSlugs) {
    if (!courseSlugSet.has(courseSlug)) {
      errors.push(`Path ${path.slug} references missing course ${courseSlug}.`);
    }
  }
}

for (const lesson of lessonFiles) {
  const result = lessonFrontmatterSchema.safeParse(lesson.frontmatter);

  if (!result.success) {
    errors.push(
      `${lesson.relativePath} has invalid frontmatter: ${result.error.issues
        .map((issue) => `${issue.path.join(".") || "frontmatter"} ${issue.message}`)
        .join("; ")}`,
    );
  }
}

reportValidationResult("Content validation", errors);
