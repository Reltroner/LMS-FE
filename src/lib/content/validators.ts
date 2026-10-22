import { z } from "zod";

const text = z.string().trim().min(1);
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const strings = z.array(text);
const slugs = z.array(slugSchema);
const status = z.enum(["draft", "published", "archived"]);
const level = z.enum(["beginner", "beginner-intermediate", "intermediate", "advanced"]);

export const lessonMetadataSchema = z.strictObject({
  title: text, summary: text,
  kind: z.enum(["lesson", "lab", "checkpoint", "capstone"]),
  status, level, durationMinutes: z.number().int().positive(),
  objectives: strings.min(1), outputs: strings.min(1), tags: strings.min(1),
  resourceIds: strings.optional(),
});

export const courseDefinitionSchema = z.strictObject({
  id: text, slug: slugSchema, aliases: slugs.optional(),
  title: text, subtitle: text, summary: text,
  category: z.enum(["backend-engineering", "worldbuilding", "creative-system"]),
  level, status, estimatedHours: z.number().positive(),
  prerequisiteCourseSlugs: slugs.optional(), finalDeliverable: text.optional(),
  authorSlug: slugSchema.optional(), objectives: strings.min(1).optional(),
  modules: z.array(z.strictObject({
    id: text, slug: slugSchema, title: text, summary: text,
    lessonSlugs: slugs.min(1),
  })).min(1),
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
  source_path: z.string().regex(/^content\/courses\/[a-z0-9-]+\/lessons\/[a-z0-9-]+\.mdx$/),
  legacy_route: z.string().regex(/^\/courses\/[a-z0-9-]+\/lessons\/[a-z0-9-]+$/),
  status: text.optional(), approval: text.optional(),
});

export const identityRegistrySchema = z.object({
  schema_version: z.literal(1),
  registry_authority: z.literal("LMS-FE_GIT_CONTENT_NOT_STUDIO_CANON"),
  lesson_count: z.number().int().nonnegative().optional(),
  records: z.array(identityRecordSchema),
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
