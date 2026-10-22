import type { Course, Lesson, Resource } from "../../types/course.ts";
import type { LearningPath } from "../../types/path.ts";
import type { PublicCatalog } from "./compiler.ts";

// Pure shared queries: no authoring imports, filesystem, or publication guesses.
export function createCourseQueries(data: PublicCatalog) {
  const getCourseBySlug = (slug: string): Course | undefined =>
    data.courses.find((course) => course.slug === slug || course.aliases?.includes(slug));
  const getLessonBySlug = (courseSlug: string, lessonSlug: string): Lesson | undefined => {
    const course = getCourseBySlug(courseSlug);
    return course && data.lessons.find((lesson) => lesson.courseSlug === course.slug && lesson.slug === lessonSlug);
  };
  const getLessonsByCourseSlug = (slug: string): readonly Lesson[] => {
    const course = getCourseBySlug(slug);
    if (!course) return [];
    return course.modules.flatMap((module) => module.lessonSlugs.map((lessonSlug) => {
      const lesson = getLessonBySlug(course.slug, lessonSlug);
      if (!lesson) throw new Error(`Compiled catalog missing registered lesson: ${course.slug}/${lessonSlug}`);
      return lesson;
    }));
  };
  const getResourceById = (id: string): Resource | undefined => data.resources.find((r) => r.id === id);
  return {
    getCourseBySlug, getLessonBySlug, getLessonsByCourseSlug, getResourceById,
    getPublishedCourses: (): readonly Course[] => data.courses,
    getResourcesByCourseSlug: (slug: string): readonly Resource[] => {
      const course = getCourseBySlug(slug);
      return course ? data.resources.filter((r) => r.courseSlug === course.slug) : [];
    },
    getResourcesByIds: (ids?: readonly string[]): readonly Resource[] => (ids ?? []).map((id) => {
      const resource = getResourceById(id);
      if (!resource) throw new Error(`Compiled catalog missing resource: ${id}`);
      return resource;
    }),
    getPathBySlug: (slug: string): LearningPath | undefined => data.paths.find((p) => p.slug === slug),
    getPublishedPaths: (): readonly LearningPath[] => data.paths,
    getCourseDuration: (slug: string) => getLessonsByCourseSlug(slug).reduce((n, l) => n + l.durationMinutes, 0),
    getLessonNavigation: (courseSlug: string, lessonSlug: string) => {
      const lessons = getLessonsByCourseSlug(courseSlug);
      const index = lessons.findIndex((l) => l.slug === lessonSlug);
      if (index < 0) return undefined;
      return { current: lessons[index], previous: lessons[index - 1] ?? null, next: lessons[index + 1] ?? null };
    },
    getCourseRouteParams: () => data.courses.flatMap((c) => [c.slug, ...(c.aliases ?? [])].map((slug) => ({ slug }))),
    getLessonRouteParams: () => data.courses.flatMap((c) => [c.slug, ...(c.aliases ?? [])].flatMap((slug) =>
      getLessonsByCourseSlug(c.slug).map((l) => ({ slug, lesson: l.slug })))),
  };
}
