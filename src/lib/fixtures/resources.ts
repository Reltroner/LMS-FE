import type { Resource } from "@/types/course";

/**
 * RESOURCE FIXTURES
 * ----------------------------------------------------------------------------
 * Backend Engineering resources mirror the real LMS-FE catalog
 * (src/catalog/courses/backend-engineering/resources.ts).
 * ----------------------------------------------------------------------------
 */

export const resources: readonly Resource[] = [
  {
    id: "be-mdn-http-overview",
    courseSlug: "backend-engineering",
    type: "external-link",
    title: "MDN HTTP Overview",
    summary: "Reference documentation for core HTTP concepts.",
    url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview",
  },
  {
    id: "be-mdn-http-methods",
    courseSlug: "backend-engineering",
    type: "external-link",
    title: "MDN HTTP Request Methods",
    summary: "Reference documentation for standard HTTP methods.",
    url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods",
  },
  {
    id: "be-rfc-9110",
    courseSlug: "backend-engineering",
    type: "external-link",
    title: "RFC 9110 — HTTP Semantics",
    summary: "Authoritative semantics for HTTP/1.1 and HTTP/2.",
    url: "https://www.rfc-editor.org/rfc/rfc9110.html",
  },
] as const;

export function getResourcesByCourseSlug(
  courseSlug: string,
): readonly Resource[] {
  return resources.filter((r) => r.courseSlug === courseSlug);
}

export function getResourceById(id: string): Resource | undefined {
  return resources.find((r) => r.id === id);
}

export function getResourcesByIds(
  ids: readonly string[] | undefined,
): readonly Resource[] {
  if (!ids) return [];
  return ids
    .map((id) => getResourceById(id))
    .filter((r): r is Resource => Boolean(r));
}
