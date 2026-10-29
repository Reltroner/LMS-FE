export const courseRoute = (slug: string) => `/courses/${slug}`;
export const lessonRoute = (courseSlug: string, lessonSlug: string) =>
  `${courseRoute(courseSlug)}/lessons/${lessonSlug}`;
export const pathRoute = (slug: string) => `/paths/${slug}`;
