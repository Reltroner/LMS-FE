import "server-only";
import { lessonBodies } from "../../../.public-content/lesson-bodies";
import { getCourseBySlug, getLessonBySlug } from "./course-registry";
import { LessonContent } from "../../components/lesson/LessonContent";

const components = {
  Callout: ({ text, tone }: { text: string; tone: "info" | "tip" | "warning" }) =>
    <LessonContent blocks={[{ type: "callout", text, tone }]} />,
  Checkpoint: ({ title, items }: { title: string; items: string }) =>
    <LessonContent blocks={[{ type: "checkpoint", title, items: items.split("\n").filter((item) => item.trim()) }]} />,
  ul: (props: React.ComponentProps<"ul">) => <ul {...props} className="list-disc" />,
  ol: (props: React.ComponentProps<"ol">) => <ol {...props} className="list-decimal" />,
};

export function getLessonContent(courseSlug: string, lessonSlug: string) {
  const course = getCourseBySlug(courseSlug);
  const lesson = getLessonBySlug(courseSlug, lessonSlug);
  if (!course || !lesson) throw new Error(`Lesson content is not public: ${courseSlug}/${lessonSlug}`);
  const Content = lessonBodies[`${course.slug}/${lesson.slug}`];
  if (!Content) throw new Error(`Missing compiled MDX body: ${course.slug}/${lesson.slug}`);
  return <Content components={components} />;
}
