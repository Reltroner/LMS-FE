import { z } from "zod";
import {
  approvedMediaRepositories, commitShaPattern, isSafeAssetPath,
  spotifyEpisodeIdPattern, youtubeVideoIdPattern,
} from "./lesson-media.ts";

const text = z.string().trim().min(1);
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const strings = z.array(text);
const slugs = z.array(slugSchema);
const status = z.enum(["draft", "published", "archived"]);
const level = z.enum(["beginner", "beginner-intermediate", "intermediate", "advanced"]);

// Media fields carry identifiers only; URLs are derived by lesson-media.ts, never authored.
const pinnedAsset = <F extends "pdf" | "png">(format: F) => ({
  provider: z.literal("github-cdn"),
  repository: z.string().refine((value) => approvedMediaRepositories.includes(value),
    "Expected an approved lesson resource repository"),
  revision: z.string().regex(commitShaPattern, "Expected an immutable 40-character commit SHA"),
  path: z.string().refine((value) => isSafeAssetPath(value, `.${format}`),
    `Expected a normalized repository-relative .${format} path`),
  format: z.literal(format),
});
const pixels = z.number().int().positive().max(20_000);

export const lessonMediaSchema = z.strictObject({
  video: z.strictObject({
    provider: z.literal("youtube"),
    videoId: z.string().regex(youtubeVideoIdPattern, "Expected an 11-character YouTube video ID"),
  }).optional(),
  audio: z.strictObject({
    provider: z.literal("spotify"),
    episodeId: z.string().regex(spotifyEpisodeIdPattern, "Expected a 22-character Spotify episode ID"),
  }).optional(),
  slides: z.strictObject(pinnedAsset("pdf")).optional(),
  infographic: z.strictObject({ ...pinnedAsset("png"), alt: text.max(500), width: pixels, height: pixels }).optional(),
}).refine((media) => Object.keys(media).length > 0, "Omit media instead of declaring no formats");

export const lessonMetadataSchema = z.strictObject({
  title: text, summary: text,
  kind: z.enum(["lesson", "lab", "checkpoint", "capstone"]),
  status, level, durationMinutes: z.number().int().positive(),
  objectives: strings.min(1), outputs: strings.min(1), tags: strings.min(1),
  resourceIds: strings.optional(),
  media: lessonMediaSchema.optional(),
});

// Deterministic names: lowercase ASCII, apostrophes dropped, other punctuation runs become "-".
export const titleSlug = (title: string) =>
  title.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
// The slug an authored planned lesson must use: "01.02" + "Worldbuilding vs Storytelling vs Lore" -> "01-02-worldbuilding-vs-...".
export const plannedLessonSlug = (lesson: { number: string; title: string }) =>
  `${lesson.number.replace(".", "-")}-${titleSlug(lesson.title)}`;

// A module's lessons live in content/courses/{course}/{directory}/{lessonSlug}.mdx. A numbered
// directory (module-NN-{title slug}) owns lesson numbers NN.xx; "lessons" is the historical flat layout.
const moduleDirectory = z.string().regex(/^(?:lessons|module-\d{2}(?:-[a-z0-9]+)+)$/);
export const lessonSourcePattern = /^content\/courses\/([a-z0-9-]+)\/(lessons|module-\d{2}(?:-[a-z0-9]+)+)\/([a-z0-9-]+)\.mdx$/;
const lessonSourcePath = z.string().regex(lessonSourcePattern);

const courseModuleSchema = z.strictObject({
  id: text, slug: slugSchema, title: text, summary: text,
  directory: moduleDirectory,
  // Authored and registered lessons only; planned syllabus entries never require an MDX file.
  lessonSlugs: slugs,
  plannedLessons: z.array(z.strictObject({ number: z.string().regex(/^\d{2}\.\d{2}$/), title: text })).min(1).optional(),
}).superRefine((module, ctx) => {
  const issue = (message: string) => ctx.addIssue({ code: "custom", message: `${module.id}: ${message}` });
  if (!module.lessonSlugs.length && !module.plannedLessons) issue("declares no authored or planned lessons");
  const number = /^module-(\d{2})-/.exec(module.directory)?.[1];
  if (!number) {
    if (module.plannedLessons) issue("planned lessons require a numbered module directory");
    return;
  }
  const expected = `module-${number}-${titleSlug(module.title)}`;
  if (module.directory !== expected) issue(`directory must be ${expected}`);
  const planned = module.plannedLessons ?? [];
  const plannedSlugs = planned.map(plannedLessonSlug);
  if (new Set(planned.map((lesson) => lesson.number)).size !== planned.length) issue("duplicate planned lesson number");
  for (const lesson of planned) {
    if (!lesson.number.startsWith(`${number}.`)) issue(`planned lesson ${lesson.number} is not numbered for module ${number}`);
  }
  for (const slug of module.lessonSlugs) {
    if (!slug.startsWith(`${number}-`)) issue(`lesson ${slug} cannot belong to module ${number}`);
    else if (planned.length && !plannedSlugs.includes(slug)) issue(`lesson ${slug} must be a planned lesson number plus its title slug`);
  }
});

export const courseDefinitionSchema = z.strictObject({
  id: text, slug: slugSchema, aliases: slugs.optional(),
  title: text, subtitle: text, summary: text,
  category: z.enum(["worldbuilding", "creative-system"]),
  level, status, estimatedHours: z.number().positive(),
  prerequisiteCourseSlugs: slugs.optional(), finalDeliverable: text.optional(),
  authorSlug: slugSchema.optional(), objectives: strings.min(1).optional(),
  modules: z.array(courseModuleSchema).min(1),
});

export const pathDefinitionSchema = z.strictObject({
  id: text, slug: slugSchema, title: text, subtitle: text, summary: text,
  level: z.enum(["beginner", "beginner-to-intermediate", "intermediate", "advanced"]),
  status, estimatedHours: z.number().positive(), courseSlugs: slugs.min(1),
});

export const resourceSchema = z.strictObject({
  id: text, courseSlug: slugSchema,
  type: z.enum(["download", "external-link", "pdf", "video", "slide-deck", "diagram"]),
  title: text, summary: text,
  filename: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/).optional(),
  url: text.refine((value) => {
    if (/^\/(?!\/)/.test(value)) return !value.includes("..") && !value.includes("\\");
    try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
  }, "Expected an HTTP(S) URL or safe site-relative resource path"),
});

export const identityRecordSchema = z.strictObject({
  lesson_id: text,
  source_path: lessonSourcePath,
  legacy_route: z.string().regex(/^\/courses\/[a-z0-9-]+\/lessons\/[a-z0-9-]+$/),
  status: text.optional(), approval: text.optional(),
});

export const identityRegistrySchema = z.object({
  schema_version: z.literal(1),
  registry_authority: z.literal("LMS-FE_GIT_CONTENT_NOT_STUDIO_CANON"),
  lesson_count: z.number().int().nonnegative().optional(),
  records: z.array(identityRecordSchema),
});

// Lifecycle of registered identities. No record means active at its registered source path.
// Retired sources stay recoverable at last_source_commit; migrated sources keep course, slug and route.
export const lifecycleSchema = z.object({
  schema_version: z.literal(1),
  registry_authority: z.literal("LMS-FE_GIT_CONTENT_NOT_STUDIO_CANON"),
  records: z.array(z.discriminatedUnion("disposition", [
    z.strictObject({ lesson_id: text, disposition: z.literal("retired"), reason: text,
      last_source_commit: z.string().regex(commitShaPattern) }),
    z.strictObject({ lesson_id: text, disposition: z.literal("migrated"), current_source_path: lessonSourcePath }),
  ])),
});

export const denylistSchema = z.object({
  schema_version: z.literal(1),
  denied: z.array(z.object({
    kind: z.enum(["course", "path"]), slug: slugSchema, route: text, title: text,
  })),
});

export type CourseDefinition = z.infer<typeof courseDefinitionSchema>;
export type IdentityRecord = z.infer<typeof identityRecordSchema>;

export function assertUnique(values: readonly string[], context: string) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) throw new Error(`${context}: duplicate ${value}`);
    seen.add(value);
  }
}
