// Build/test-only module. App and component imports must use public queries.
import fs from "node:fs";
import path from "node:path";
import { compile } from "@mdx-js/mdx";
import { parseDocument } from "yaml";
import type { Root } from "mdast";
import type { Node } from "unist";
import type { Course, Lesson, Resource } from "../../types/course.ts";
import type { LearningPath } from "../../types/path.ts";
import { lessonRoute } from "../routes/route-builders.ts";
import { isPublicEntry } from "./filters.ts";
import { isPinnedApprovedCdnUrl, lessonImageSource } from "./lesson-media.ts";
import {
  assertUnique, courseDefinitionSchema, pathDefinitionSchema, resourceSchema,
  lessonMetadataSchema, identityRegistrySchema, denylistSchema, slugSchema,
  lessonSourcePattern, lifecycleSchema, plannedLessonSlug,
} from "./validators.ts";

export type CatalogInputs = {
  catalog: readonly { course: unknown; resources: readonly unknown[] }[];
  paths: readonly unknown[];
  publicCourseSlugs: readonly string[];
  publicPathSlugs: readonly string[];
  legacyRegistry: unknown;
  additionsRegistry: unknown;
  lifecycle?: unknown;
  denylist: unknown;
};

// The single source-resolution contract: a lesson lives in its owning module's declared directory.
export const lessonSourcePath = (courseSlug: string, moduleDirectory: string, lessonSlug: string) =>
  `content/courses/${courseSlug}/${moduleDirectory}/${lessonSlug}.mdx`;
const nonLessonDirectories = new Set(["author", "resources"]);

export type PublicCatalog = {
  courses: Course[];
  lessons: (Lesson & { courseSlug: string })[];
  resources: Resource[];
  paths: LearningPath[];
};
export type CompiledLesson = Lesson & {
  courseSlug: string; sourcePath: string; source: string; body: string; code: string;
};

function regularFile(root: string, relative: string) {
  const base = path.resolve(root);
  const absolute = path.resolve(base, relative);
  if (!absolute.startsWith(`${base}${path.sep}`)) throw new Error(`Path escapes source root: ${relative}`);
  let current = base;
  for (const segment of path.relative(base, absolute).split(path.sep)) {
    current = path.join(current, segment);
    if (!fs.existsSync(current)) throw new Error(`Missing registered source: ${relative}`);
    if (fs.lstatSync(current).isSymbolicLink()) throw new Error(`Symlinked source is forbidden: ${relative}`);
  }
  if (!fs.lstatSync(absolute).isFile()) throw new Error(`Expected regular source file: ${relative}`);
  return absolute;
}

export function parseLesson(source: string, sourcePath: string) {
  const normalized = source.replace(/\r\n?/g, "\n");
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(normalized);
  if (!match) throw new Error(`${sourcePath}: missing YAML frontmatter`);
  const document = parseDocument(match[1], { uniqueKeys: true });
  if (document.errors.length) throw new Error(`${sourcePath}: ${document.errors.map((e) => e.message).join("; ")}`);
  const metadata = lessonMetadataSchema.safeParse(document.toJS({ maxAliasCount: 0 }));
  if (!metadata.success) throw new Error(`${sourcePath}: invalid frontmatter: ${metadata.error.message}`);
  const body = normalized.slice(match[0].length).trim();
  if (!body) throw new Error(`${sourcePath}: empty lesson body`);
  return { metadata: metadata.data, body, source: normalized };
}

type WalkNode = Node & {
  name?: string; children?: WalkNode[]; url?: string; alt?: string | null;
  attributes?: { type: string; name?: string; value?: unknown }[];
};

// MDX stays expressive through Markdown and the existing reusable blocks.
// Imports/executable expressions cannot smuggle private modules into public output.
// Images fail closed: pinned approved CDN assets or existing public/ files, with alt text.
function authoringMdxContract(root: string) {
  return (tree: Root) => {
    let blockIndex = 0;
    function visit(node: WalkNode) {
      if (["mdxjsEsm", "mdxFlowExpression", "mdxTextExpression"].includes(node.type)) {
        throw new Error("MDX imports, exports and executable expressions are not supported in course content");
      }
      if (node.type === "imageReference") throw new Error("Lesson images must use inline ![alt](url) syntax");
      if (node.type === "image") {
        const source = lessonImageSource(node.url ?? "");
        if (!node.alt?.trim()) throw new Error(`Lesson image requires descriptive alt text: ${node.url}`);
        if (!source) throw new Error(`Lesson image must be a pinned approved CDN asset or a public/ file: ${node.url}`);
        if (source === "site") {
          try { regularFile(root, `public${node.url}`); } catch { throw new Error(`Lesson image not found in public/: ${node.url}`); }
        }
      }
      if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
        if (!["Callout", "Checkpoint"].includes(node.name ?? "")) {
          throw new Error(`Unsupported MDX component: ${node.name}`);
        }
        const values: Record<string, string> = {};
        for (const attr of node.attributes ?? []) {
          if (attr.type !== "mdxJsxAttribute" || !attr.name || typeof attr.value !== "string") {
            throw new Error("MDX component attributes must be static strings");
          }
          if (Object.hasOwn(values, attr.name)) throw new Error(`Duplicate MDX attribute: ${attr.name}`);
          values[attr.name] = attr.value;
        }
        if (node.name === "Callout") {
          if (!values.text?.trim() || !["info", "tip", "warning"].includes(values.tone) ||
              Object.keys(values).some((key) => !["text", "tone"].includes(key))) {
            throw new Error("Callout requires static text and an info/tip/warning tone");
          }
        } else if (!values.title?.trim() || !values.items?.trim() ||
                   Object.keys(values).some((key) => !["title", "items"].includes(key))) {
          throw new Error("Checkpoint requires static title and newline-separated items");
        }
        if (node.children?.length) throw new Error("Callout/Checkpoint use attributes, not child content");
      }
      if (node.type === "heading") {
        node.data = { ...node.data, hProperties: { id: `section-${blockIndex}` } };
      }
      node.children?.forEach(visit);
    }
    for (const child of tree.children) {
      visit(child as WalkNode);
      blockIndex++;
    }
  };
}

export async function compileCatalog(root: string, inputs: CatalogInputs) {
  const entries = inputs.catalog.map((entry) => ({
    course: courseDefinitionSchema.parse(entry.course),
    resources: entry.resources.map((resource) => resourceSchema.parse(resource)),
  }));
  const paths = inputs.paths.map((entry) => pathDefinitionSchema.parse(entry));
  const legacy = identityRegistrySchema.parse(inputs.legacyRegistry);
  const additions = identityRegistrySchema.parse(inputs.additionsRegistry);
  const lifecycle = lifecycleSchema.parse(inputs.lifecycle ??
    { schema_version: 1, registry_authority: "LMS-FE_GIT_CONTENT_NOT_STUDIO_CANON", records: [] });
  const denied = denylistSchema.parse(inputs.denylist).denied;
  if (legacy.lesson_count !== legacy.records.length) throw new Error("Historical identity count does not match its records");
  const records = [...legacy.records, ...additions.records];
  assertUnique(records.map((r) => r.lesson_id), "Stable lesson IDs");
  assertUnique(records.map((r) => r.source_path), "Stable source paths");
  assertUnique(records.map((r) => r.legacy_route), "Legacy lesson routes");
  const sourceParts = (sourcePath: string) => {
    const [, course, moduleDirectory, slug] = lessonSourcePattern.exec(sourcePath) ?? [];
    return { course, moduleDirectory, slug };
  };
  for (const record of records) {
    const { course, slug } = sourceParts(record.source_path);
    if (record.legacy_route !== lessonRoute(course, slug)) {
      throw new Error(`Identity rename requires an explicit migration/alias decision: ${record.source_path}`);
    }
  }
  // Identities are never deleted: retirement removes the active source, migration moves it
  // within the same course and slug, so routes and IDs stay traceable.
  assertUnique(lifecycle.records.map((r) => r.lesson_id), "Lesson lifecycle records");
  const dispositions = new Map(lifecycle.records.map((r) => [r.lesson_id, r]));
  for (const id of dispositions.keys()) {
    if (!records.some((r) => r.lesson_id === id)) throw new Error(`Lifecycle record for unregistered lesson ID: ${id}`);
  }
  const retiredSources = new Set<string>();
  const activeRecords = records.flatMap((record) => {
    const disposition = dispositions.get(record.lesson_id);
    if (disposition?.disposition === "retired") {
      retiredSources.add(record.source_path);
      return [];
    }
    if (disposition?.disposition !== "migrated") return [record];
    const from = sourceParts(record.source_path);
    const to = sourceParts(disposition.current_source_path);
    if (to.course !== from.course || to.slug !== from.slug || to.moduleDirectory === from.moduleDirectory) {
      throw new Error(`Migration must keep course and lesson slug and change directory: ${record.lesson_id}`);
    }
    return [{ ...record, source_path: disposition.current_source_path }];
  });
  assertUnique(activeRecords.map((r) => r.source_path), "Active lesson sources");
  assertUnique(entries.map(({ course }) => course.id), "Course IDs");
  assertUnique(entries.flatMap(({ course }) => [course.slug, ...(course.aliases ?? [])]), "Course slugs/aliases");
  assertUnique(paths.map((p) => p.id), "Path IDs");
  assertUnique(paths.map((p) => p.slug), "Path slugs");
  const resources = entries.flatMap((e) => e.resources);
  assertUnique(resources.map((r) => r.id), "Resource IDs");
  const courseSlugs = new Set(entries.map((e) => e.course.slug));
  for (const list of [inputs.publicCourseSlugs, inputs.publicPathSlugs]) {
    assertUnique(list, "Publication allowlist");
    list.forEach((slug) => slugSchema.parse(slug));
  }
  for (const slug of inputs.publicCourseSlugs) {
    if (!courseSlugs.has(slug)) throw new Error(`Unresolved public course allowlist: ${slug}`);
  }
  for (const slug of inputs.publicPathSlugs) {
    if (!paths.some((p) => p.slug === slug)) throw new Error(`Unresolved public path allowlist: ${slug}`);
  }
  for (const p of paths) {
    assertUnique(p.courseSlugs, `${p.slug} path membership`);
    for (const slug of p.courseSlugs) {
      if (!courseSlugs.has(slug)) throw new Error(`${p.slug}: unresolved path course ${slug}`);
    }
  }
  const directory = path.join(root, "content/courses");
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory() || !courseSlugs.has(entry.name)) {
      throw new Error(`Orphan course directory: ${entry.name}`);
    }
  }
  const allLessons: CompiledLesson[] = [];
  const ownedSources = new Set<string>();
  for (const { course, resources: localResources } of entries) {
    assertUnique(course.modules.map((m) => m.id), `${course.slug} module IDs`);
    assertUnique(course.modules.map((m) => m.slug), `${course.slug} module slugs`);
    assertUnique(course.modules.flatMap((m) => /^module-(\d{2})-/.exec(m.directory)?.[1] ?? []), `${course.slug} module numbers`);
    assertUnique(course.modules.flatMap((m) => m.lessonSlugs), `${course.slug} module membership`);
    assertUnique(course.prerequisiteCourseSlugs ?? [], `${course.slug} prerequisites`);
    for (const slug of course.prerequisiteCourseSlugs ?? []) {
      if (!courseSlugs.has(slug) || slug === course.slug) throw new Error(`${course.slug}: invalid prerequisite ${slug}`);
    }
    for (const r of localResources) {
      if (r.courseSlug !== course.slug) throw new Error(`${r.id}: resource belongs to another course`);
      if (r.type === "download" && !r.filename) throw new Error(`${r.id}: download requires a source filename`);
      if (r.filename) regularFile(root, `content/courses/${course.slug}/resources/${r.filename}`);
    }
    const resourceDir = path.join(directory, course.slug, "resources");
    if (fs.existsSync(resourceDir)) {
      for (const name of fs.readdirSync(resourceDir)) {
        if (name !== "README.md" && !localResources.some((r) => r.filename === name)) {
          throw new Error(`${course.slug}: orphan resource file ${name}`);
        }
      }
    }
    for (const { directory: moduleDirectory, lessonSlugs } of course.modules) for (const slug of lessonSlugs) {
      const sourcePath = lessonSourcePath(course.slug, moduleDirectory, slug);
      if (retiredSources.has(sourcePath)) throw new Error(`Retired lesson identity cannot be active: ${sourcePath}`);
      const record = activeRecords.find((r) => r.source_path === sourcePath);
      if (!record) throw new Error(`Unregistered stable identity: ${sourcePath}`);
      const parsed = parseLesson(fs.readFileSync(regularFile(root, sourcePath), "utf8"), sourcePath);
      assertUnique(parsed.metadata.resourceIds ?? [], `${sourcePath} resources`);
      for (const id of parsed.metadata.resourceIds ?? []) {
        if (!localResources.some((r) => r.id === id)) throw new Error(`${sourcePath}: unresolved resource ${id}`);
      }
      let code: string;
      try {
        code = String(await compile({ path: sourcePath, value: parsed.body }, {
          outputFormat: "program", development: false, remarkPlugins: [[authoringMdxContract, root]],
        }));
      } catch (error) {
        throw new Error(`${sourcePath}: MDX compilation failed`, { cause: error });
      }
      allLessons.push({ ...parsed.metadata, id: record.lesson_id, slug,
        courseSlug: course.slug, sourcePath, source: parsed.source, body: parsed.body, code });
      ownedSources.add(sourcePath);
    }
    // Lesson content may only sit in a declared module directory, and every file there needs an owner.
    const courseDirectory = path.join(directory, course.slug);
    const moduleDirectories = new Set(course.modules.map((m) => m.directory));
    for (const entry of fs.existsSync(courseDirectory) ? fs.readdirSync(courseDirectory, { withFileTypes: true }) : []) {
      if (entry.isDirectory() && nonLessonDirectories.has(entry.name)) continue;
      if (!entry.isDirectory() || !moduleDirectories.has(entry.name)) {
        throw new Error(`${course.slug}: content outside a declared module directory: ${entry.name}`);
      }
      for (const name of fs.readdirSync(path.join(courseDirectory, entry.name))) {
        if (!ownedSources.has(`content/courses/${course.slug}/${entry.name}/${name}`)) {
          throw new Error(`${course.slug}: orphan lesson file ${entry.name}/${name}`);
        }
      }
    }
  }
  for (const r of activeRecords) {
    if (!ownedSources.has(r.source_path)) throw new Error(`Identity source has no module owner: ${r.source_path}`);
  }
  // Prerequisite cycles are broken course structures, even while private.
  function visitPrerequisites(slug: string, ancestors: Set<string>) {
    if (ancestors.has(slug)) throw new Error(`Prerequisite cycle: ${[...ancestors, slug].join(" -> ")}`);
    const entry = entries.find((e) => e.course.slug === slug);
    for (const prerequisite of entry?.course.prerequisiteCourseSlugs ?? []) {
      visitPrerequisites(prerequisite, new Set([...ancestors, slug]));
    }
  }
  entries.forEach((e) => visitPrerequisites(e.course.slug, new Set()));
  const deniedCourses = denied.filter((d) => d.kind === "course").map((d) => d.slug);
  const deniedPaths = denied.filter((d) => d.kind === "path").map((d) => d.slug);
  const publicEntries = entries.filter(({ course }) => isPublicEntry(course, inputs.publicCourseSlugs, deniedCourses));
  const publicSlugs = new Set(publicEntries.map((e) => e.course.slug));
  const publicLessons = allLessons.filter((l) => publicSlugs.has(l.courseSlug) && l.status === "published");
  const publicCourses: Course[] = publicEntries.map(({ course }) => {
    if (course.aliases?.some((alias) => deniedCourses.includes(alias))) throw new Error(`${course.slug}: denied alias`);
    for (const slug of course.prerequisiteCourseSlugs ?? []) {
      if (!publicSlugs.has(slug)) throw new Error(`${course.slug}: private prerequisite ${slug}`);
    }
    // Authoring layout stays out of public data. A published course's planned syllabus is public
    // course information; only published lessons carry a lessonSlug (a route), planned ones never do.
    const modules = course.modules.map(({ directory: moduleDirectory, plannedLessons, ...module }) => {
      void moduleDirectory;
      const lessonSlugs = module.lessonSlugs.filter((slug) => publicLessons.some((l) => l.courseSlug === course.slug && l.slug === slug));
      const syllabus = plannedLessons?.map(({ number, title }) => {
        const slug = plannedLessonSlug({ number, title });
        return lessonSlugs.includes(slug) ? { number, title, lessonSlug: slug } : { number, title };
      });
      return { ...module, lessonSlugs, ...(syllabus && { syllabus }) };
    });
    if (!modules.some((module) => module.lessonSlugs.length > 0)) {
      throw new Error(`${course.slug}: published course has no eligible lessons`);
    }
    return { ...course, modules, pathSlugs: [] };
  });
  const publicPaths = paths.filter((p) => isPublicEntry(p, inputs.publicPathSlugs, deniedPaths));
  for (const p of publicPaths) {
    for (const slug of p.courseSlugs) {
      if (!publicSlugs.has(slug)) throw new Error(`${p.slug}: private course reference ${slug}`);
    }
  }
  // A jsDelivr resource is published only when pinned to a commit of an approved resource
  // repository (the lesson-asset rule). Others — such as worksheets on a mutable tag of a repository
  // that was never published — are withheld until fixed, and a public lesson cannot cite one.
  const courseResources = resources.filter((r) => publicSlugs.has(r.courseSlug));
  const publishable = (r: Resource) => !r.url.startsWith("https://cdn.jsdelivr.net/") || isPinnedApprovedCdnUrl(r.url);
  const publicResources = courseResources.filter(publishable);
  const withheldResources = courseResources.filter((r) => !publishable(r));
  for (const lesson of publicLessons) {
    const withheld = (lesson.resourceIds ?? []).find((id) => withheldResources.some((r) => r.id === id));
    if (withheld) throw new Error(`${lesson.sourcePath}: published lesson cites withheld resource ${withheld}`);
  }
  for (const resource of publicResources) {
    if (resource.url.startsWith("/")) regularFile(root, `public${resource.url}`);
  }
  const publicData: PublicCatalog = {
    courses: publicCourses.map((course) => ({ ...course,
      pathSlugs: publicPaths.filter((p) => p.courseSlugs.includes(course.slug)).map((p) => p.slug),
    })), paths: publicPaths, resources: publicResources,
    lessons: publicLessons.map(({ sourcePath, source, body, code, ...metadata }) => {
      void sourcePath; void source; void body; void code;
      return metadata;
    }),
  };
  return { publicData, allLessons, publicLessons, entries, paths, withheldResources };
}
