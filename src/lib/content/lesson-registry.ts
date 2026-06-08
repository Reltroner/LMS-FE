import { allLessons, type Lesson as ContentlayerLesson } from "@/lib/content/contentlayer";
import { getAllCourses, getCourseBySlug, getCourseRouteSlugs } from "@/lib/content/course-registry";
import { lessonUrl } from "@/lib/routes/route-builders";
import type { CourseModuleWithLessons } from "@/types/module";

export type LessonDocument = ContentlayerLesson &
  Readonly<{
    courseTitle: string;
    moduleSlug: string;
    moduleTitle: string;
    moduleOrder: number;
    lessonOrder: number;
    durationLabel: string;
    url: string;
  }>;

export type CourseModuleWithLessonDocuments = CourseModuleWithLessons<LessonDocument>;

type LessonContext = Readonly<{
  courseTitle: string;
  moduleSlug: string;
  moduleTitle: string;
  moduleOrder: number;
  lessonOrder: number;
}>;

function getLessonContext(courseSlug: string, lessonSlug: string): LessonContext {
  const course = getCourseBySlug(courseSlug);

  if (!course) {
    return {
      courseTitle: "Unknown Course",
      moduleSlug: "unassigned",
      moduleTitle: "Unassigned",
      moduleOrder: Number.MAX_SAFE_INTEGER,
      lessonOrder: Number.MAX_SAFE_INTEGER,
    };
  }

  for (const [moduleIndex, courseModule] of course.modules.entries()) {
    const lessonIndex = courseModule.lessonSlugs.indexOf(lessonSlug);

    if (lessonIndex >= 0) {
      return {
        courseTitle: course.title,
        moduleSlug: courseModule.slug,
        moduleTitle: courseModule.title,
        moduleOrder: moduleIndex + 1,
        lessonOrder: lessonIndex + 1,
      };
    }
  }

  return {
    courseTitle: course.title,
    moduleSlug: "unassigned",
    moduleTitle: "Unassigned",
    moduleOrder: Number.MAX_SAFE_INTEGER,
    lessonOrder: Number.MAX_SAFE_INTEGER,
  };
}

function enrichLesson(lesson: ContentlayerLesson): LessonDocument {
  const context = getLessonContext(lesson.courseSlug, lesson.slug);

  return {
    ...lesson,
    ...context,
    durationLabel: `${lesson.durationMinutes} min`,
    url: lessonUrl(lesson.courseSlug, lesson.slug),
  };
}

function compareLessons(leftLesson: LessonDocument, rightLesson: LessonDocument) {
  if (leftLesson.courseSlug !== rightLesson.courseSlug) {
    return leftLesson.courseSlug.localeCompare(rightLesson.courseSlug);
  }

  if (leftLesson.moduleOrder !== rightLesson.moduleOrder) {
    return leftLesson.moduleOrder - rightLesson.moduleOrder;
  }

  if (leftLesson.lessonOrder !== rightLesson.lessonOrder) {
    return leftLesson.lessonOrder - rightLesson.lessonOrder;
  }

  return leftLesson.title.localeCompare(rightLesson.title);
}

function sortLessons(lessons: readonly LessonDocument[]): LessonDocument[] {
  return [...lessons].sort(compareLessons);
}

export function getAllLessons(): readonly LessonDocument[] {
  return sortLessons(allLessons.map(enrichLesson));
}

export function getLessonsByCourseSlug(courseSlug: string): readonly LessonDocument[] {
  return sortLessons(
    allLessons.filter((lesson) => lesson.courseSlug === courseSlug).map(enrichLesson),
  );
}

export function getLessonsByCourse(courseSlug: string): readonly LessonDocument[] {
  return getLessonsByCourseSlug(courseSlug);
}

export function getLessonBySlug(
  courseSlug: string,
  lessonSlug: string,
): LessonDocument | undefined {
  const lesson = allLessons.find(
    (lessonDocument) =>
      lessonDocument.courseSlug === courseSlug && lessonDocument.slug === lessonSlug,
  );

  return lesson ? enrichLesson(lesson) : undefined;
}

export function getCourseModulesWithLessons(
  courseSlug: string,
): readonly CourseModuleWithLessonDocuments[] {
  const course = getCourseBySlug(courseSlug);

  if (!course) {
    return [];
  }

  return course.modules.map((courseModule, moduleIndex) => ({
    ...courseModule,
    order: moduleIndex + 1,
    lessons: courseModule.lessonSlugs
      .map((lessonSlug) => getLessonBySlug(course.slug, lessonSlug))
      .filter((lesson): lesson is LessonDocument => Boolean(lesson)),
  }));
}

export function getNextPreviousLesson(courseSlug: string, lessonSlug: string) {
  const lessons = getLessonsByCourseSlug(courseSlug);
  const currentLessonIndex = lessons.findIndex((lesson) => lesson.slug === lessonSlug);

  return {
    previousLesson: currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : undefined,
    nextLesson:
      currentLessonIndex >= 0 && currentLessonIndex < lessons.length - 1
        ? lessons[currentLessonIndex + 1]
        : undefined,
  };
}

export function getAllLessonRouteParams() {
  return getAllCourses().flatMap((course) =>
    getCourseRouteSlugs(course).flatMap((courseRouteSlug) =>
      getLessonsByCourseSlug(course.slug).map((lesson) => ({
        slug: courseRouteSlug,
        lesson: lesson.slug,
      })),
    ),
  );
}
