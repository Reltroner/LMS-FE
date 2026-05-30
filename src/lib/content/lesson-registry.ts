import { allLessons, type Lesson as ContentlayerLesson } from "contentlayer/generated";

export type LessonDocument = ContentlayerLesson;

function sortLessons(lessons: readonly LessonDocument[]): LessonDocument[] {
  return [...lessons].sort((a, b) => a.order - b.order);
}

export function getAllLessons(): readonly LessonDocument[] {
  return sortLessons(allLessons);
}

export function getLessonsByCourse(courseSlug: string): readonly LessonDocument[] {
  return sortLessons(allLessons.filter((lesson) => lesson.course === courseSlug));
}

export function getLessonBySlug(slug: string): LessonDocument | undefined {
  return allLessons.find((lesson) => lesson.slug === slug);
}
