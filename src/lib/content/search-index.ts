import { getAllCourses, getCourseBySlug } from "@/lib/content/course-registry";
import { getAllLessons } from "@/lib/content/lesson-registry";

export type SearchItemType = "course" | "lesson";

export type SearchItem = Readonly<{
  id: string;
  title: string;
  description: string;
  url: string;
  type: SearchItemType;
}>;

export function getSearchIndex(): readonly SearchItem[] {
  const courseItems = getAllCourses().map((course) => ({
    id: `course:${course.id}`,
    title: course.title,
    description: course.description,
    url: `/courses/${course.slug}`,
    type: "course" as const,
  }));

  const lessonItems = getAllLessons().map((lesson) => {
    const course = getCourseBySlug(lesson.course);
    const lessonContext = course ? `${course.title} · ${lesson.description}` : lesson.description;

    return {
      id: `lesson:${lesson._id}`,
      title: lesson.title,
      description: lessonContext,
      url: `/courses/${lesson.course}/lessons/${lesson.slug}`,
      type: "lesson" as const,
    };
  });

  return [...courseItems, ...lessonItems];
}
