import { createHash } from "node:crypto";
import type { CompiledLesson, PublicCatalog } from "../content/compiler.ts";
import type { CourseDefinition } from "../content/validators.ts";
import { courseRoute, lessonRoute, pathRoute } from "../routes/route-builders.ts";
import type { KnowledgeChunk, KnowledgeIndex, KnowledgeSourceType } from "./types.ts";

export type IngestionInput = Readonly<{
  publicData: PublicCatalog;
  publicLessons: readonly CompiledLesson[];
  entries?: readonly { course: CourseDefinition; resources: readonly unknown[] }[];
}>;

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/**
 * Safely converts MDX educational prose into clean, human-readable text.
 * Preserves image alt text, Callout/Checkpoint content, and list items while
 * stripping raw MDX/JSX syntax, code fences, and asset URLs.
 */
export function cleanMdxText(raw: string): string {
  let text = raw.replace(/\r\n?/g, "\n");

  // Remove any ESM import/export lines defensively
  text = text.replace(/^\s*(?:import|export)\s+.*$/gm, "");

  // Extract Callout attributes: <Callout tone="tip" text="..." />
  text = text.replace(/<Callout\b([^>]*)\/>/g, (_, attrs: string) => {
    const tone = /\btone="([^"]*)"/.exec(attrs)?.[1] ?? "note";
    const body = /\btext="([^"]*)"/.exec(attrs)?.[1] ?? "";
    return body.trim() ? `Note (${tone}): ${body.trim()}` : "";
  });

  // Extract Checkpoint attributes: <Checkpoint title="..." items="..." />
  text = text.replace(/<Checkpoint\b([^>]*)\/>/g, (_, attrs: string) => {
    const title = /\btitle="([^"]*)"/.exec(attrs)?.[1] ?? "Checkpoint";
    const items = /\bitems="([^"]*)"/.exec(attrs)?.[1] ?? "";
    return items.trim() ? `${title}: ${items.replace(/\\n|\n/g, "; ").trim()}` : "";
  });

  // Strip any remaining JSX/HTML tags
  text = text.replace(/<\/?[A-Za-z][^>]*>/g, "");

  // Preserve image alt text and drop the raw URL: ![alt](url) -> Diagram: alt
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt: string) => {
    const trimmed = alt.trim();
    return trimmed ? `Diagram: ${trimmed}` : "";
  });

  // Convert Markdown links [label](url) -> label
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");

  // Remove fenced code block markers while keeping the readable content inside
  text = text.replace(/^```[a-zA-Z0-9_-]*\s*$/gm, "");

  // Remove inline emphasis markers (**, *, `) while keeping text
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/\*([^*\n]+)\*/g, "$1");
  text = text.replace(/`([^`\n]+)`/g, "$1");

  // Normalize bullet points and whitespace
  text = text
    .split("\n")
    .map((line) => line.replace(/^\s*[-*]\s+/, "• ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text;
}

export type ExtractedSection = Readonly<{
  sectionId: string;
  heading: string;
  content: string;
}>;

const MAX_CHUNK_CHARS = 1400;

function splitParagraphsIntoBoundedChunks(
  paragraphs: readonly string[],
  baseSectionId: string,
  heading: string,
): ExtractedSection[] {
  const results: ExtractedSection[] = [];
  let current: string[] = [];
  let currentLen = 0;
  let part = 1;

  const flush = () => {
    const joined = current.join("\n\n").trim();
    if (!joined) return;
    const sectionId = part === 1 && results.length === 0 ? baseSectionId : `${baseSectionId}-p${part}`;
    results.push({ sectionId, heading, content: joined });
    part += 1;
    current = [];
    currentLen = 0;
  };

  for (const para of paragraphs) {
    const cleaned = cleanMdxText(para);
    if (!cleaned) continue;
    if (currentLen > 0 && currentLen + cleaned.length + 2 > MAX_CHUNK_CHARS) {
      flush();
    }
    current.push(cleaned);
    currentLen += cleaned.length + 2;
  }
  flush();

  return results;
}

/**
 * Splits an MDX lesson body into heading-scoped coherent sections without
 * cutting definitions or paragraphs in half.
 */
export function extractMdxSections(mdxBody: string, fallbackHeading: string): ExtractedSection[] {
  const normalized = mdxBody.replace(/\r\n?/g, "\n").trim();
  if (!normalized) return [];

  const lines = normalized.split("\n");
  const rawSections: { heading: string; lines: string[]; index: number }[] = [];
  let currentHeading = fallbackHeading;
  let currentLines: string[] = [];
  let sectionCounter = 0;
  let inCodeFence = false;

  const pushCurrent = () => {
    if (currentLines.length > 0) {
      rawSections.push({
        heading: currentHeading,
        lines: currentLines,
        index: sectionCounter,
      });
      currentLines = [];
    }
  };

  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      inCodeFence = !inCodeFence;
      currentLines.push(line);
      continue;
    }
    if (!inCodeFence) {
      const headingMatch = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
      if (headingMatch) {
        pushCurrent();
        sectionCounter += 1;
        currentHeading = cleanMdxText(headingMatch[2]);
        continue;
      }
    }
    currentLines.push(line);
  }
  pushCurrent();

  const sections: ExtractedSection[] = [];
  for (const raw of rawSections) {
    const rawBlock = raw.lines.join("\n").trim();
    if (!rawBlock) continue;
    const paragraphs = rawBlock.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    const baseSectionId = `section-${raw.index}`;
    const bounded = splitParagraphsIntoBoundedChunks(paragraphs, baseSectionId, raw.heading);
    sections.push(...bounded);
  }

  return sections;
}

function makeChunk(params: {
  idSeed: string;
  courseSlug: string;
  pathSlug?: string;
  lessonId?: string;
  lessonSlug?: string;
  sectionId: string;
  sourceType: KnowledgeSourceType;
  title: string;
  heading: string;
  content: string;
  tags: readonly string[];
  sourceUrl: string;
}): KnowledgeChunk {
  const normalizedContent = params.content.replace(/\s+/g, " ").trim();
  const contentHash = sha256(
    JSON.stringify({
      courseSlug: params.courseSlug,
      lessonId: params.lessonId ?? null,
      sectionId: params.sectionId,
      title: params.title,
      heading: params.heading,
      content: normalizedContent,
      sourceUrl: params.sourceUrl,
    }),
  ).slice(0, 32);
  const id = `kc-${sha256(params.idSeed).slice(0, 16)}`;
  return {
    id,
    courseSlug: params.courseSlug,
    ...(params.pathSlug ? { pathSlug: params.pathSlug } : {}),
    ...(params.lessonId ? { lessonId: params.lessonId } : {}),
    ...(params.lessonSlug ? { lessonSlug: params.lessonSlug } : {}),
    sectionId: params.sectionId,
    sourceType: params.sourceType,
    title: params.title,
    heading: params.heading,
    content: params.content.trim(),
    tags: [...params.tags],
    sourceUrl: params.sourceUrl,
    visibility: "public",
    contentHash,
  };
}

/**
 * Deterministically builds the public RAG knowledge index exclusively from
 * publication-approved catalog data and published MDX lessons.
 * Authorization filtering occurs strictly BEFORE indexing.
 */
export function buildKnowledgeIndex(input: IngestionInput): KnowledgeIndex {
  const { publicData, publicLessons, entries = [] } = input;

  // Enforce pre-index authorization invariant: only published courses, paths, and lessons may be indexed.
  const approvedCourseSlugs = new Set<string>();
  for (const course of publicData.courses) {
    if (course.status !== "published" || course.isSynthetic) {
      throw new Error(`Refusing to index non-public course: ${course.slug} (status=${course.status})`);
    }
    approvedCourseSlugs.add(course.slug);
  }

  for (const path of publicData.paths) {
    if (path.status !== "published") {
      throw new Error(`Refusing to index non-public learning path: ${path.slug} (status=${path.status})`);
    }
    for (const courseSlug of path.courseSlugs) {
      if (!approvedCourseSlugs.has(courseSlug)) {
        throw new Error(`Refusing to index path ${path.slug} referencing non-public course ${courseSlug}`);
      }
    }
  }

  const publicLessonIds = new Set(publicData.lessons.map((l) => l.id));
  const eligibleLessons = publicLessons.filter(
    (lesson) =>
      lesson.status === "published" &&
      approvedCourseSlugs.has(lesson.courseSlug) &&
      publicLessonIds.has(lesson.id),
  );

  const chunks: KnowledgeChunk[] = [];
  const seenContentFingerprints = new Set<string>();

  const pushUniqueChunk = (chunk: KnowledgeChunk) => {
    if (!chunk.content.trim()) return;
    const fingerprint = `${chunk.sourceUrl}::${chunk.content.replace(/\s+/g, " ").trim().toLowerCase()}`;
    if (seenContentFingerprints.has(fingerprint)) return;
    seenContentFingerprints.add(fingerprint);
    chunks.push(chunk);
  };

  // 1. Index published courses
  for (const course of publicData.courses) {
    const courseLessons = eligibleLessons.filter((l) => l.courseSlug === course.slug);
    const rawDefinition = entries.find((e) => e.course.slug === course.slug)?.course;
    const totalPlannedCount = rawDefinition
      ? rawDefinition.modules.reduce((acc, m) => acc + (m.plannedLessons?.length ?? m.lessonSlugs.length), 0)
      : courseLessons.length;
    const totalModuleCount = rawDefinition ? rawDefinition.modules.length : course.modules.length;
    const publishedLessonTitles = courseLessons.map((l) => `${l.title} (${l.slug})`).join(", ");

    const availabilityNote =
      totalPlannedCount > courseLessons.length
        ? `Curriculum status: ${courseLessons.length} of ${totalPlannedCount} planned syllabus lessons across ${totalModuleCount} modules ${courseLessons.length === 1 ? "is" : "are"} currently published and available (${publishedLessonTitles || "none"}). The remaining ${totalPlannedCount - courseLessons.length} lessons in the ${totalPlannedCount}-lesson syllabus are planned curriculum inventory and are not yet published.`
        : `Curriculum status: ${courseLessons.length} published ${courseLessons.length === 1 ? "lesson" : "lessons"} across ${totalModuleCount} modules.`;

    const moduleSummaries = course.modules
      .map((m, idx) => `Module ${idx + 1}: ${m.title} — ${m.summary}`)
      .join("\n");

    const courseContent = [
      `${course.title}: ${course.subtitle}`,
      course.summary,
      course.finalDeliverable ? `Final deliverable: ${course.finalDeliverable}.` : "",
      availabilityNote,
      moduleSummaries ? `Modules:\n${moduleSummaries}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    pushUniqueChunk(
      makeChunk({
        idSeed: `course:${course.id}:overview`,
        courseSlug: course.slug,
        sectionId: "course-overview",
        sourceType: "course",
        title: course.title,
        heading: "Course Overview & Curriculum Availability",
        content: courseContent,
        tags: [course.category, course.level, "course", "syllabus", "curriculum", course.slug],
        sourceUrl: courseRoute(course.slug),
      }),
    );

    const courseResources = publicData.resources.filter((r) => r.courseSlug === course.slug);
    if (courseResources.length > 0) {
      const resourceContent = [
        `Public educational resources and worksheets for ${course.title}:`,
        ...courseResources.map((r) => `• ${r.title}: ${r.summary}`),
      ].join("\n");

      pushUniqueChunk(
        makeChunk({
          idSeed: `course:${course.id}:resources`,
          courseSlug: course.slug,
          sectionId: "course-resources",
          sourceType: "course",
          title: course.title,
          heading: "Course Resources & Worksheets",
          content: resourceContent,
          tags: [course.category, "resources", "worksheets", "templates", course.slug],
          sourceUrl: courseRoute(course.slug),
        }),
      );
    }
  }

  // 2. Index published learning paths
  for (const path of publicData.paths) {
    const primaryCourseSlug = path.courseSlugs[0] ?? "";
    const memberCourses = path.courseSlugs
      .map((slug) => publicData.courses.find((c) => c.slug === slug))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
    const totalPublishedLessons = memberCourses.reduce(
      (sum, c) => sum + eligibleLessons.filter((l) => l.courseSlug === c.slug).length,
      0,
    );

    const pathContent = [
      `Learning Path — ${path.title}: ${path.subtitle}`,
      path.summary,
      `Level: ${path.level}. Estimated effort: ~${path.estimatedHours} hours.`,
      `Included published courses: ${memberCourses.map((c) => c.title).join(", ")}. Currently available published lessons in this path: ${totalPublishedLessons} (starting with Lesson 01.01 — What Is Worldbuilding?). Planned future lessons remain in planned inventory until approved.`,
    ].join("\n\n");

    pushUniqueChunk(
      makeChunk({
        idSeed: `path:${path.id}:overview`,
        courseSlug: primaryCourseSlug,
        pathSlug: path.slug,
        sectionId: "path-overview",
        sourceType: "path",
        title: path.title,
        heading: "Learning Path Overview",
        content: pathContent,
        tags: ["learning-path", path.level, path.slug, ...path.courseSlugs],
        sourceUrl: pathRoute(path.slug),
      }),
    );
  }

  // 3. Index published lessons (overview + MDX sections)
  for (const lesson of eligibleLessons) {
    const url = lessonRoute(lesson.courseSlug, lesson.slug);
    const overviewText = [
      `${lesson.title} — ${lesson.summary}`,
      lesson.objectives.length > 0
        ? `Learning objectives:\n${lesson.objectives.map((o) => `• ${o}`).join("\n")}`
        : "",
      lesson.outputs.length > 0
        ? `Expected outputs:\n${lesson.outputs.map((o) => `• ${o}`).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    if (overviewText.trim()) {
      pushUniqueChunk(
        makeChunk({
          idSeed: `lesson:${lesson.id}:overview`,
          courseSlug: lesson.courseSlug,
          lessonId: lesson.id,
          lessonSlug: lesson.slug,
          sectionId: "lesson-overview",
          sourceType: "lesson",
          title: lesson.title,
          heading: "Lesson Overview & Learning Objectives",
          content: overviewText,
          tags: lesson.tags,
          sourceUrl: url,
        }),
      );
    }

    const sections = extractMdxSections(lesson.body, lesson.title);
    for (const section of sections) {
      if (!section.content.trim()) continue;
      pushUniqueChunk(
        makeChunk({
          idSeed: `lesson:${lesson.id}:${section.sectionId}:${section.heading}`,
          courseSlug: lesson.courseSlug,
          lessonId: lesson.id,
          lessonSlug: lesson.slug,
          sectionId: section.sectionId,
          sourceType: "lesson",
          title: lesson.title,
          heading: section.heading,
          content: section.content,
          tags: lesson.tags,
          sourceUrl: url,
        }),
      );
    }
  }

  // Deterministic ordering by chunk ID
  const orderedChunks = [...chunks];
  const versionDigest = sha256(
    orderedChunks.map((c) => `${c.id}:${c.contentHash}`).join("|"),
  ).slice(0, 24);

  return {
    schemaVersion: 1,
    indexVersion: `idx-v1-${versionDigest}`,
    visibility: "public",
    courseCount: publicData.courses.length,
    lessonCount: eligibleLessons.length,
    pathCount: publicData.paths.length,
    chunkCount: orderedChunks.length,
    chunks: orderedChunks,
  };
}
