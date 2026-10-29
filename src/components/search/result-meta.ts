import type { KnowledgeSearchResult } from "@/lib/knowledge/types";

// Presentation helpers shared by the Ctrl+K palette and the full Search page.

// "01-01-what-is-worldbuilding" -> "01.01"
export function lessonNumber(lessonSlug?: string) {
  const match = /^(\d{2})-(\d{2})-/.exec(lessonSlug ?? "");
  return match ? `${match[1]}.${match[2]}` : null;
}

export function sourceLabel(result: Pick<KnowledgeSearchResult, "sourceType" | "lessonSlug">) {
  if (result.sourceType === "lesson") {
    const number = lessonNumber(result.lessonSlug);
    return number ? `Lesson ${number}` : "Lesson";
  }
  return result.sourceType === "course" ? "Course" : "Learning path";
}

// The passage heading leads; the source title gives context underneath.
export function resultHeading(result: Pick<KnowledgeSearchResult, "title" | "heading">) {
  return result.heading && result.heading !== result.title ? result.heading : result.title;
}

export const MAX_SEARCH_QUERY_CHARS = 180;

export function boundedQuery(value: string | null | undefined) {
  return (value ?? "").slice(0, MAX_SEARCH_QUERY_CHARS);
}

export const searchHref = (query: string) => `/search/?q=${encodeURIComponent(boundedQuery(query).trim())}`;
export const aiGuideHref = (query: string) => `/ai/?q=${encodeURIComponent(boundedQuery(query).trim())}`;
