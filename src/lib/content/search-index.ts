import { getAllCourses } from "@/lib/content/course-registry";
import { getAllLessons } from "@/lib/content/lesson-registry";
import { getAllPaths } from "@/lib/content/path-registry";
import { courseUrl, lessonUrl, pathUrl } from "@/lib/routes/route-builders";

export type SearchItemType = "course" | "lesson" | "path";

export type SearchItem = Readonly<{
  id: string;
  type: SearchItemType;
  title: string;
  summary: string;
  url: string;
  courseSlug?: string;
  tags: readonly string[];
}>;

export function getSearchIndex(): readonly SearchItem[] {
  const courseItems = getAllCourses().map((course) => ({
    id: `course:${course.id}`,
    type: "course" as const,
    title: course.title,
    summary: course.summary,
    url: courseUrl(course.slug),
    tags: [course.category, course.level],
  }));

  const lessonItems = getAllLessons().map((lesson) => ({
    id: `lesson:${lesson._id}`,
    type: "lesson" as const,
    title: lesson.title,
    summary: `${lesson.courseTitle} - ${lesson.summary}`,
    url: lessonUrl(lesson.courseSlug, lesson.slug),
    courseSlug: lesson.courseSlug,
    tags: lesson.tags,
  }));

  const pathItems = getAllPaths().map((path) => ({
    id: `path:${path.id}`,
    type: "path" as const,
    title: path.title,
    summary: path.summary,
    url: pathUrl(path.slug),
    tags: [path.level],
  }));

  return [...courseItems, ...lessonItems, ...pathItems];
}
