import type { CourseStatus } from "../../types/course.ts";

export function isPublicEntry(
  entry: { slug: string; status: CourseStatus },
  allowlist: readonly string[],
  denied: readonly string[],
): boolean {
  return entry.status === "published" && allowlist.includes(entry.slug) && !denied.includes(entry.slug);
}
