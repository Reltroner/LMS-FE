export type Lesson = Readonly<{
  id: string;
  slug: string;
  title: string;
  description: string;
  duration: number;
  order: number;
}>;
