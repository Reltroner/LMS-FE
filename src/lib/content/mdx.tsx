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
  // Code/template blocks scroll sideways on narrow screens; tabIndex lets keyboard users scroll them.
  pre: (props: React.ComponentProps<"pre">) => <pre {...props} tabIndex={0} />,
  ol: (props: React.ComponentProps<"ol">) => <ol {...props} className="list-decimal" />,
  // Lesson diagrams (source and alt text enforced by the compiler) load near the viewport, not on page
  // load or when a linked lesson is prefetched. Static export disables image optimization.
  img: ({ alt, ...props }: React.ComponentProps<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={alt} loading="lazy" decoding="async" />
  ),
};

export function getLessonContent(courseSlug: string, lessonSlug: string) {
  const course = getCourseBySlug(courseSlug);
  const lesson = getLessonBySlug(courseSlug, lessonSlug);
  if (!course || !lesson) throw new Error(`Lesson content is not public: ${courseSlug}/${lessonSlug}`);
  const Content = lessonBodies[`${course.slug}/${lesson.slug}`];
  if (!Content) throw new Error(`Missing compiled MDX body: ${course.slug}/${lesson.slug}`);
  return <Content components={components} />;
}
