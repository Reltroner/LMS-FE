import type { Lesson } from "@/types/lesson";

export type CourseModule = Readonly<{
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  lessons: readonly Lesson[];
}>;
