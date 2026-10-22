import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { compileCatalog } from "../src/lib/content/compiler.ts";
import { createCourseQueries } from "../src/lib/content/queries.ts";
import { catalogInputs } from "../scripts/catalog-inputs.ts";
import { preparePublicContent } from "../scripts/prepare-public-content.ts";
import { verifyPublicOutput } from "../scripts/verify-public-output.ts";

const root = process.cwd();
const lessonSource = (title = "Introduction", status = "published") => `---
title: "${title}"
summary: "An isolated course architecture regression lesson."
kind: "lesson"
status: "${status}"
level: "beginner"
durationMinutes: 10
objectives: ["Explain the test topic."]
outputs: ["Test notes"]
tags: ["testing"]
---

## Test topic

An isolated test lesson; never committed to the real catalog.
`;
const registry = (records = []) => ({
  schema_version: 1, registry_authority: "LMS-FE_GIT_CONTENT_NOT_STUDIO_CANON", records,
});
const definition = (slug, status = "published", lessonSlugs = ["01-introduction"]) => ({
  id: `course-${slug}`, slug, title: `Course ${slug}`, subtitle: "Test course", summary: "Test course summary",
  category: "backend-engineering", level: "beginner", status, estimatedHours: 1,
  modules: [{ id: `module-${slug}`, slug: "foundations", title: "Foundations", summary: "Test foundations", lessonSlugs }],
});
function addLesson(base, inputs, courseSlug, slug, source, id) {
  const source_path = `content/courses/${courseSlug}/lessons/${slug}.mdx`;
  fs.mkdirSync(path.dirname(path.join(base, source_path)), { recursive: true });
  fs.writeFileSync(path.join(base, source_path), source);
  inputs.additionsRegistry.records.push({ lesson_id: id, source_path,
    legacy_route: `/courses/${courseSlug}/lessons/${slug}` });
}
function fixture(t) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "lms-course-test-"));
  t.after(() => {
    assert.equal(path.dirname(base), path.resolve(os.tmpdir()));
    assert.ok(path.basename(base).startsWith("lms-course-test-"));
    fs.rmSync(base, { recursive: true, force: true });
  });
  const inputs = {
    catalog: [{ course: definition("course-a", "published", ["02-second", "01-introduction"]), resources: [] },
      { course: definition("course-b"), resources: [] }],
    paths: [], publicCourseSlugs: ["course-a", "course-b"], publicPathSlugs: [],
    legacyRegistry: { ...registry(), lesson_count: 0 }, additionsRegistry: registry(),
    denylist: { schema_version: 1, denied: [] },
  };
  addLesson(base, inputs, "course-a", "01-introduction", lessonSource("Course A intro"), "test-a-intro");
  addLesson(base, inputs, "course-a", "02-second", lessonSource("Course A second"), "test-a-second");
  addLesson(base, inputs, "course-b", "01-introduction", lessonSource("Course B intro"), "test-b-intro");
  return { base, inputs };
}

test("real catalog resolves valid authoring graph, preserves identities, and retires IT courses", async () => {
  const result = await compileCatalog(root, catalogInputs(root));
  const q = createCourseQueries(result.publicData);
  assert.equal(result.allLessons.length, 31);
  assert.equal(q.getPublishedCourses().length, 0);
  assert.equal(q.getPublishedPaths().length, 0);
  assert.equal(q.getCourseBySlug("backend-engineering-fundamentals"), undefined);
  assert.equal(q.getCourseBySlug("backend-engineering"), undefined);
  assert.equal(q.getCourseBySlug("worldbuilding-operating-system"), undefined);
  assert.equal(q.getCourseBySlug("in-world-living-lab"), undefined);
  assert.equal(result.entries.find((e) => e.course.slug === "backend-engineering").course.status, "archived");
  assert.equal(result.entries.find((e) => e.course.slug === "worldbuilding-operating-system").course.status, "draft");
  assert.equal(result.entries.find((e) => e.course.slug === "in-world-living-lab").course.status, "draft");
});

test("historical identity file remains byte-identical, independent of new capacity", () => {
  const source = fs.readFileSync("contracts/catalog/lesson-id-registry.json");
  assert.equal(createHash("sha256").update(source).digest("hex"),
    "644c0e353cd95febcdde0a4d4f2d293fce6efc71084082ab99467a0cb7376579");
});

test("same local slug in two courses has distinct identities and bodies", async (t) => {
  const { base, inputs } = fixture(t);
  const result = await compileCatalog(base, inputs);
  const q = createCourseQueries(result.publicData);
  assert.equal(q.getLessonBySlug("course-a", "01-introduction").id, "test-a-intro");
  assert.equal(q.getLessonBySlug("course-b", "01-introduction").id, "test-b-intro");
  assert.equal(q.getLessonBySlug("course-b", "02-second"), undefined);
  assert.match(result.allLessons.find((l) => l.id === "test-b-intro").source, /Course B intro/);
});

test("module order governs navigation and duration, independent of filename order", async (t) => {
  const { base, inputs } = fixture(t);
  inputs.catalog[0].course.modules = [
    { ...inputs.catalog[0].course.modules[0], lessonSlugs: ["02-second"] },
    { id: "later", slug: "later", title: "Later", summary: "Later module", lessonSlugs: ["01-introduction"] },
  ];
  const q = createCourseQueries((await compileCatalog(base, inputs)).publicData);
  assert.deepEqual(q.getLessonsByCourseSlug("course-a").map((l) => l.slug), ["02-second", "01-introduction"]);
  assert.equal(q.getLessonNavigation("course-a", "02-second").previous, null);
  assert.equal(q.getLessonNavigation("course-a", "02-second").next.slug, "01-introduction");
  assert.equal(q.getLessonNavigation("course-a", "01-introduction").next, null);
  assert.equal(q.getLessonNavigation("course-a", "missing"), undefined);
});

for (const status of ["draft", "archived"]) {
  test(`${status} course stays absent even when accidentally allowlisted`, async (t) => {
    const { base, inputs } = fixture(t);
    inputs.catalog[1].course.status = status;
    const result = await preparePublicContent(base, inputs);
    const q = createCourseQueries(result.publicData);
    assert.equal(q.getCourseBySlug("course-b"), undefined);
    assert.ok(!q.getLessonRouteParams().some((p) => p.slug === "course-b"));
    const files = fs.readdirSync(path.join(base, ".public-content"), { recursive: true }).map(String);
    assert.ok(!files.some((file) => file.includes("course-b")));
    assert.ok(!JSON.stringify(result.publicData).includes("Course B intro"));
  });
  test(`${status} lesson stays absent from listing, modules and navigation`, async (t) => {
    const { base, inputs } = fixture(t);
    fs.writeFileSync(path.join(base, "content/courses/course-a/lessons/01-introduction.mdx"), lessonSource("Private intro", status));
    const q = createCourseQueries((await compileCatalog(base, inputs)).publicData);
    assert.deepEqual(q.getLessonsByCourseSlug("course-a").map((l) => l.slug), ["02-second"]);
    assert.equal(q.getLessonBySlug("course-a", "01-introduction"), undefined);
    assert.equal(q.getLessonNavigation("course-a", "02-second").next, null);
  });
}

test("published status alone cannot authorize new courses or paths", async (t) => {
  const { base, inputs } = fixture(t);
  inputs.publicCourseSlugs = ["course-a"];
  inputs.paths.push({ id: "path-new", slug: "new-path", title: "New path", subtitle: "Test",
    summary: "Test path", level: "beginner", status: "published", estimatedHours: 1, courseSlugs: ["course-a"] });
  const result = await compileCatalog(base, inputs);
  assert.deepEqual(result.publicData.courses.map((c) => c.slug), ["course-a"]);
  assert.deepEqual(result.publicData.paths, []);
});

const negativeCases = [
  ["missing registered lesson", (base) => fs.unlinkSync(path.join(base, "content/courses/course-a/lessons/01-introduction.mdx")), /Missing registered source/],
  ["duplicate stable ID", (_base, inputs) => { inputs.additionsRegistry.records[1].lesson_id = "test-a-intro"; }, /Stable lesson IDs: duplicate/],
  ["duplicate membership", (_base, inputs) => { inputs.catalog[0].course.modules[0].lessonSlugs.push("01-introduction"); }, /module membership: duplicate/],
  ["duplicate module identity", (_base, inputs) => { inputs.catalog[0].course.modules.push({ ...inputs.catalog[0].course.modules[0] }); }, /module IDs: duplicate/],
  ["invalid prerequisite", (_base, inputs) => { inputs.catalog[0].course.prerequisiteCourseSlugs = ["missing"]; }, /invalid prerequisite/],
  ["prerequisite cycle", (_base, inputs) => { inputs.catalog[0].course.prerequisiteCourseSlugs = ["course-b"]; inputs.catalog[1].course.prerequisiteCourseSlugs = ["course-a"]; }, /Prerequisite cycle/],
  ["invalid resource reference", (base) => { const f = path.join(base, "content/courses/course-a/lessons/01-introduction.mdx"); fs.writeFileSync(f, lessonSource().replace('kind: "lesson"', 'resourceIds: ["missing-resource"]\nkind: "lesson"')); }, /unresolved resource/],
  ["orphan lesson", (base) => fs.writeFileSync(path.join(base, "content/courses/course-a/lessons/orphan.mdx"), lessonSource()), /orphan lesson file/],
  ["unregistered lesson identity", (_base, inputs) => { inputs.additionsRegistry.records.pop(); }, /Unregistered stable identity/],
  ["implicit rename", (_base, inputs) => { inputs.additionsRegistry.records[0].legacy_route = "/courses/course-a/lessons/renamed"; }, /explicit migration/],
  ["malformed new course", (_base, inputs) => { inputs.catalog[1].course.title = ""; }, /too_small/],
  ["alias collision", (_base, inputs) => { inputs.catalog[0].course.aliases = ["course-b"]; }, /slugs\/aliases: duplicate/],
  ["private public-path member", (_base, inputs) => { inputs.catalog[1].course.status = "draft"; inputs.publicPathSlugs.push("path-test"); inputs.paths.push({ id: "path-test", slug: "path-test", title: "Test", subtitle: "Test", summary: "Test", level: "beginner", status: "published", estimatedHours: 1, courseSlugs: ["course-b"] }); }, /private course reference/],
  ["unsafe resource URL", (_base, inputs) => { inputs.catalog[0].resources.push({ id: "r", courseSlug: "course-a", type: "external-link", title: "Test", summary: "Test", url: "javascript:alert(1)" }); }, /HTTP\(S\)/],
  ["MDX private import", (base) => { const f = path.join(base, "content/courses/course-a/lessons/01-introduction.mdx"); fs.writeFileSync(f, lessonSource() + '\nimport secret from "../private.mdx"\n'); }, /MDX compilation failed/],
];
for (const [name, mutate, diagnostic] of negativeCases) {
  test(`${name} fails clearly`, async (t) => {
    const { base, inputs } = fixture(t);
    mutate(base, inputs);
    await assert.rejects(compileCatalog(base, inputs), diagnostic);
  });
}

for (const [name, replace] of [
  ["missing field", (source) => source.replace('title: "Introduction"\n', "")],
  ["unsupported enum", (source) => source.replace('kind: "lesson"', 'kind: "unsupported"')],
  ["non-number duration", (source) => source.replace("durationMinutes: 10", 'durationMinutes: "10"')],
  ["zero duration", (source) => source.replace("durationMinutes: 10", "durationMinutes: 0")],
  ["empty objective", (source) => source.replace('objectives: ["Explain the test topic."]', 'objectives: [""]')],
  ["duplicate YAML key", (source) => source.replace("durationMinutes: 10", "durationMinutes: 10\ndurationMinutes: 20")],
]) {
  test(`invalid frontmatter: ${name}`, async (t) => {
    const { base, inputs } = fixture(t);
    fs.writeFileSync(path.join(base, "content/courses/course-a/lessons/01-introduction.mdx"), replace(lessonSource()));
    await assert.rejects(compileCatalog(base, inputs), /frontmatter|unique/);
  });
}

test("draft onboarding extends beyond 31 identities without changing public output or UI", async (t) => {
  const { base } = fixture(t);
  fs.cpSync(path.join(root, "content"), path.join(base, "content"), { recursive: true });
  // Remove only the generated isolated fixture's two course directories.
  for (const slug of ["course-a", "course-b"]) {
    const target = path.join(base, "content/courses", slug);
    assert.ok(target.startsWith(`${base}${path.sep}`));
    fs.rmSync(target, { recursive: true });
  }
  const inputs = structuredClone(catalogInputs(root));
  const before = await preparePublicContent(base, inputs);
  const slugs = Array.from({ length: 36 }, (_, i) => `lesson-${i + 1}`);
  const definitionDir = path.join(base, "src/catalog/courses/example-course");
  fs.mkdirSync(definitionDir, { recursive: true });
  fs.writeFileSync(path.join(definitionDir, "course.ts"),
    `export const course = ${JSON.stringify(definition("example-course", "draft", slugs), null, 2)};\n`);
  const registryFile = path.join(base, "src/catalog/courses/index.ts");
  fs.writeFileSync(registryFile, [
    'import { course } from "./example-course/course.ts";',
    "export const authoringCatalog = [{ course, resources: [] }];", "",
  ].join("\n"));
  const registered = await import(pathToFileURL(registryFile).href);
  inputs.catalog.push(...registered.authoringCatalog);
  for (const [index, slug] of slugs.entries()) {
    addLesson(base, inputs, "example-course", slug, lessonSource(`New draft ${index + 1}`, "draft"), `test-new-${index + 1}`);
  }
  const identityFile = path.join(base, "contracts/catalog/lesson-id-additions.json");
  fs.mkdirSync(path.dirname(identityFile), { recursive: true });
  fs.writeFileSync(identityFile, JSON.stringify(inputs.additionsRegistry, null, 2));
  inputs.additionsRegistry = JSON.parse(fs.readFileSync(identityFile, "utf8"));
  const after = await preparePublicContent(base, inputs);
  assert.equal(after.allLessons.length, 67);
  assert.deepEqual(after.publicData, before.publicData);
  const generated = path.join(base, ".public-content");
  assert.ok(!fs.readdirSync(generated, { recursive: true }).map(String).some((file) => file.includes("example-course")));
  assert.ok(!fs.existsSync(path.join(base, "src/components")), "Onboarding needs no UI files");
  assert.deepEqual(inputs.legacyRegistry, catalogInputs(root).legacyRegistry);
});

test("public staging is deterministic, LF-only and contains no private bodies", async (t) => {
  const { base, inputs } = fixture(t);
  inputs.catalog[1].course.status = "draft";
  const first = await preparePublicContent(base, inputs);
  const file = path.join(base, ".public-content/data.json");
  const snapshot = fs.readFileSync(file, "utf8");
  await preparePublicContent(base, inputs);
  assert.equal(fs.readFileSync(file, "utf8"), snapshot);
  assert.equal(first.publicLessons.length, 2);
  assert.ok(!snapshot.includes("Course B intro"));
  const source = fs.readFileSync(path.join(base, ".public-content/courses/course-a/lessons/01-introduction.mdx"), "utf8");
  assert.ok(!source.includes("\r"));
});

test("registered resources fail closed and compiled query data cannot mask missing lessons", async (t) => {
  const { base, inputs } = fixture(t);
  const { publicData } = await compileCatalog(base, inputs);
  const q = createCourseQueries(publicData);
  assert.throws(() => q.getResourcesByIds(["missing"]), /missing resource/);
  publicData.lessons = publicData.lessons.filter((l) => l.id !== "test-a-intro");
  assert.throws(() => createCourseQueries(publicData).getLessonsByCourseSlug("course-a"), /missing registered lesson/);
});

test("actual output scanner rejects private JS/JSON/HTML/XML/text assets and hidden routes", async (t) => {
  const { base, inputs } = fixture(t);
  inputs.catalog[1].course.status = "draft";
  const result = await compileCatalog(base, inputs);
  const q = createCourseQueries(result.publicData);
  const routes = ["", "courses", "paths", "search", "my-learning",
    ...q.getCourseRouteParams().map((p) => `courses/${p.slug}`),
    ...q.getLessonRouteParams().map((p) => `courses/${p.slug}/lessons/${p.lesson}`)];
  const output = path.join(base, "out");
  for (const route of routes) {
    const target = path.join(output, route, "index.html");
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, "<main>Public fixture</main>");
  }
  assert.ok((await verifyPublicOutput(base, inputs)).files > 0);
  for (const ext of ["js", "json", "html", "xml", "txt", "svg"]) {
    const target = path.join(output, `leak.${ext}`);
    fs.writeFileSync(target, '"Course course-b"');
    await assert.rejects(verifyPublicOutput(base, inputs), /Private content in leak/);
    fs.unlinkSync(target);
  }
  fs.writeFileSync(path.join(output, "encoded.js"), String.raw`"\u0043ourse course-b"`);
  await assert.rejects(verifyPublicOutput(base, inputs), /Private content in encoded/);
  fs.unlinkSync(path.join(output, "encoded.js"));
  const hiddenRoute = path.join(output, "courses/unknown/index.html");
  fs.mkdirSync(path.dirname(hiddenRoute), { recursive: true });
  fs.writeFileSync(hiddenRoute, "<main>Unknown</main>");
  await assert.rejects(verifyPublicOutput(base, inputs), /Unapproved generated route/);
});

test("denylist and private prerequisites override allowlisted publication", async (t) => {
  const { base, inputs } = fixture(t);
  inputs.denylist.denied.push({ kind: "course", slug: "course-b", route: "/courses/course-b", title: "Course course-b" });
  assert.equal((await compileCatalog(base, inputs)).publicData.courses.length, 1);
  inputs.catalog[0].course.prerequisiteCourseSlugs = ["course-b"];
  await assert.rejects(compileCatalog(base, inputs), /private prerequisite/);
});
