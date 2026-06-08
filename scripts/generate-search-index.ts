import { courses } from "../src/catalog/courses";
import { learningPaths } from "../src/catalog/paths";
import { readLessonFiles } from "./_content-utils";

const courseItems = courses.map((course) => ({
  id: `course:${course.id}`,
  type: "course",
  title: course.title,
  summary: course.summary,
  url: `/courses/${course.slug}`,
  tags: [course.category, course.level],
}));

const lessonItems = readLessonFiles().map((lesson) => ({
  id: `lesson:${lesson.courseSlug}:${lesson.lessonSlug}`,
  type: "lesson",
  title: lesson.frontmatter.title,
  summary: lesson.frontmatter.summary,
  url: `/courses/${lesson.courseSlug}/lessons/${lesson.lessonSlug}`,
  courseSlug: lesson.courseSlug,
  tags: Array.isArray(lesson.frontmatter.tags) ? lesson.frontmatter.tags : [],
}));

const pathItems = learningPaths.map((path) => ({
  id: `path:${path.id}`,
  type: "path",
  title: path.title,
  summary: path.summary,
  url: `/paths/${path.slug}`,
  tags: [path.level],
}));

console.log(JSON.stringify([...courseItems, ...lessonItems, ...pathItems], null, 2));
