export function courseUrl(courseSlug: string) {
  return `/courses/${courseSlug}`;
}

export function lessonUrl(courseSlug: string, lessonSlug: string) {
  return `/courses/${courseSlug}/lessons/${lessonSlug}`;
}

export function pathUrl(pathSlug: string) {
  return `/paths/${pathSlug}`;
}

export function searchUrl() {
  return "/search";
}
