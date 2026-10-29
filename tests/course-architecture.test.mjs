import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { compileCatalog, lessonSourcePath } from "../src/lib/content/compiler.ts";
import { createCourseQueries } from "../src/lib/content/queries.ts";
import { titleSlug } from "../src/lib/content/validators.ts";
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
  category: "worldbuilding", level: "beginner", status, estimatedHours: 1,
  modules: [{ id: `module-${slug}`, slug: "foundations", title: "Foundations", summary: "Test foundations",
    directory: "lessons", lessonSlugs }],
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

test("real catalog resolves the active authoring graph, keeps identities traceable, and retires IT courses", async () => {
  const inputs = catalogInputs(root);
  const result = await compileCatalog(root, inputs);
  const q = createCourseQueries(result.publicData);
  // Historical identities, active authored lessons, planned syllabus and published lessons are different quantities.
  const retired = inputs.lifecycle.records.filter((r) => r.disposition === "retired");
  assert.equal(inputs.legacyRegistry.records.length, 31);
  assert.equal(result.allLessons.length,
    inputs.legacyRegistry.records.length + inputs.additionsRegistry.records.length - retired.length);
  assert.equal(result.publicLessons.length, 1);
  assert.equal(result.publicLessons[0].id, "lms-lesson-0032");
  assert.deepEqual(result.entries.map((e) => [e.course.slug, e.course.status]),
    [["worldbuilding-operating-system", "published"], ["in-world-living-lab", "draft"]]);
  assert.deepEqual(q.getPublishedCourses().map((c) => c.slug), ["worldbuilding-operating-system"]);
  assert.deepEqual(q.getPublishedPaths().map((p) => p.slug), ["worldbuilding-operating-system"]);
  assert.equal(q.getLessonBySlug("worldbuilding-operating-system", "01-01-what-is-worldbuilding")?.id, "lms-lesson-0032");
  for (const slug of ["backend-engineering-fundamentals", "backend-engineering", "in-world-living-lab"]) {
    assert.equal(q.getCourseBySlug(slug), undefined);
  }
});

test("historical identity content remains unchanged across LF and CRLF checkouts", () => {
  const source = fs.readFileSync("contracts/catalog/lesson-id-registry.json", "utf8");
  const canonicalSource = source.replace(/\r\n?|\n/g, "\r\n");
  assert.equal(createHash("sha256").update(canonicalSource, "utf8").digest("hex"),
    "644c0e353cd95febcdde0a4d4f2d293fce6efc71084082ab99467a0cb7376579");
});

const wosModule01 = "content/courses/worldbuilding-operating-system/module-01-worldbuilding-fundamentals";
const wos0101 = `${wosModule01}/01-01-what-is-worldbuilding.mdx`;
const wosDiagrams = "https://cdn.jsdelivr.net/gh/Reltroner/lms-reltroner-resource@c6f0263ca0ae888d02e87450b8d8a9a9351123ac/courses/worldbuilding-operating-system/module-01-worldbuilding-fundamentals/01-01-what-is-worldbuilding";

const wosCourse = () => structuredClone(catalogInputs(root).catalog.find((e) => e.course.slug === "worldbuilding-operating-system").course);

test("WOS defines the eight canonical syllabus modules in order with module-first directories", () => {
  assert.deepEqual(wosCourse().modules.map((m) => [m.directory, m.title]), [
    ["module-01-worldbuilding-fundamentals", "Worldbuilding Fundamentals"],
    ["module-02-creative-seeds-world-premise", "Creative Seeds & World Premise"],
    ["module-03-world-foundations-constraints", "World Foundations & Constraints"],
    ["module-04-people-places-lived-experiences", "People, Places & Lived Experiences"],
    ["module-05-world-systems-interactions", "World Systems & Interactions"],
    ["module-06-causality-change-consequences", "Causality, Change & Consequences"],
    ["module-07-world-expression-storytelling", "World Expression & Storytelling"],
    ["module-08-canon-creative-compound-workflows", "Canon & Creative Compound Workflows"],
  ]);
});

test("the 89-lesson syllabus is planned inventory, tracked apart from authored lessons", async () => {
  const course = wosCourse();
  const planned = course.modules.flatMap((m) => m.plannedLessons);
  assert.deepEqual(course.modules.map((m) => m.plannedLessons.length), [9, 10, 11, 11, 11, 12, 11, 14]);
  assert.equal(new Set(planned.map((l) => l.number)).size, 89);
  const files = planned.map((l) => `${l.number.replace(".", "-")}-${titleSlug(l.title)}`);
  assert.equal(new Set(files.map((f) => f.toLowerCase())).size, 89, "case-insensitively unique file names");
  for (const [number, title, file] of [
    ["01.01", "What Is Worldbuilding?", "01-01-what-is-worldbuilding"],
    ["02.01", "What Is a Creative Seed?", "02-01-what-is-a-creative-seed"],
    ["03.01", "What Are World Foundations?", "03-01-what-are-world-foundations"],
    ["04.08", "Agency: Why Inhabitants Make Choices", "04-08-agency-why-inhabitants-make-choices"],
    ["08.14", "Planning Independent World Expansion", "08-14-planning-independent-world-expansion"],
  ]) {
    assert.equal(planned.find((l) => l.number === number)?.title, title);
    assert.ok(files.includes(file), file);
  }
  const authored = course.modules.flatMap((m) => m.lessonSlugs);
  const { allLessons } = await compileCatalog(root, catalogInputs(root));
  assert.equal(allLessons.filter((l) => l.courseSlug === course.slug).length, authored.length);
  assert.ok(authored.every((slug) => files.includes(slug)) && authored.length < planned.length);
});

test("WOS 01.01 resolves to its module-first source as one additive published identity", async () => {
  const inputs = catalogInputs(root);
  const result = await compileCatalog(root, inputs);
  const course = result.entries.find((e) => e.course.slug === "worldbuilding-operating-system").course;
  const owner = course.modules.filter((m) => m.lessonSlugs.includes("01-01-what-is-worldbuilding"));
  assert.deepEqual(owner.map((m) => m.title), ["Worldbuilding Fundamentals"]);
  assert.equal(lessonSourcePath(course.slug, owner[0].directory, "01-01-what-is-worldbuilding"), wos0101);
  const lesson = result.allLessons.find((l) => l.slug === "01-01-what-is-worldbuilding");
  assert.deepEqual([lesson.id, lesson.sourcePath, lesson.status, course.status], ["lms-lesson-0032", wos0101, "published", "published"]);
  assert.deepEqual(inputs.additionsRegistry.records.filter((r) => r.lesson_id === "lms-lesson-0032").map((r) => [r.source_path, r.legacy_route]),
    [[wos0101, "/courses/worldbuilding-operating-system/lessons/01-01-what-is-worldbuilding"]]);
  assert.ok(!inputs.legacyRegistry.records.some((r) => r.lesson_id === "lms-lesson-0032"), "no collision with historical IDs");
  assert.ok(inputs.publicCourseSlugs.includes(course.slug));
  assert.ok(JSON.stringify(result.publicData).includes("lms-lesson-0032"));
  assert.deepEqual(fs.readdirSync(path.join(root, "content/courses/worldbuilding-operating-system")).sort(),
    ["author", "module-01-worldbuilding-fundamentals", "resources"], "no competing lesson roots");
});

test("retired legacy lessons keep traceable identities but are never active or public", async () => {
  const inputs = catalogInputs(root);
  const result = await compileCatalog(root, inputs);
  const retired = inputs.lifecycle.records.filter((r) => r.disposition === "retired");
  const historicalIds = (course) => inputs.legacyRegistry.records
    .filter((r) => r.source_path.startsWith(`content/courses/${course}/`)).map((r) => r.lesson_id);
  assert.deepEqual(retired.map((r) => r.lesson_id).sort(),
    [...historicalIds("backend-engineering"), ...historicalIds("worldbuilding-operating-system")].sort());
  for (const record of retired) {
    const identity = inputs.legacyRegistry.records.find((r) => r.lesson_id === record.lesson_id);
    assert.match(record.last_source_commit, /^[0-9a-f]{40}$/);
    assert.ok(!result.allLessons.some((l) => l.id === record.lesson_id), `${record.lesson_id} is not compiled`);
    assert.ok(!fs.existsSync(path.join(root, identity.source_path)), `${identity.source_path} is not an active source`);
  }
  assert.ok(!result.entries.some((e) => e.course.slug === "backend-engineering"));
});

test("In-World Living Lab keeps its registrations, sources and draft status", async () => {
  const inputs = catalogInputs(root);
  const result = await compileCatalog(root, inputs);
  const records = inputs.legacyRegistry.records.filter((r) => r.source_path.startsWith("content/courses/in-world-living-lab/lessons/"));
  assert.equal(records.length, 13);
  for (const record of records) {
    assert.ok(result.allLessons.some((l) => l.id === record.lesson_id && l.sourcePath === record.source_path), record.source_path);
    assert.ok(!inputs.lifecycle.records.some((r) => r.lesson_id === record.lesson_id));
  }
  assert.equal(result.entries.find((e) => e.course.slug === "in-world-living-lab").course.status, "draft");
});

test("WOS 01.01 shows its three pinned CDN diagrams once each, in their sections, with no stale images or tables", async () => {
  const { allLessons } = await compileCatalog(root, catalogInputs(root));
  const { body } = allLessons.find((l) => l.sourcePath === wos0101);
  const images = [...body.matchAll(/!\[([^\]]+)\]\(([^)]+)\)/g)].map(([, alt, url]) => ({ alt, url }));
  assert.deepEqual(images.map((i) => i.url),
    ["idea-to-world", "four-questions", "fact-to-consequence"].map((name) => `${wosDiagrams}/01-01-${name}.svg`));
  assert.ok(images.every((i) => i.alt.length >= 40), "descriptive alt text");
  const sections = body.split(/^## /m);
  for (const [name, heading] of [["idea-to-world", "Start here"], ["four-questions", "What is worldbuilding?"],
    ["fact-to-consequence", "A small world you can examine: Lumenhaven"]]) {
    const owners = sections.filter((section) => section.includes(`/01-01-${name}.svg)`));
    assert.equal(owners.length, 1);
    assert.ok(owners[0].startsWith(heading), `${name} belongs under ${heading}`);
  }
  assert.doesNotMatch(body, /\/images\/lessons|world-to-everyday-bridge|^\|.*\|$/m);
  for (const kept of ["not official Asthortera canon", "Condition → Choice → Possible effect", "**Fictional context:**",
    "**Abstract pattern:**", "**Possible everyday analogy:**", "**Limits:**", "## Check your understanding", "Next — 01.02"]) {
    assert.ok(body.includes(kept), kept);
  }
});

// Isolated clone of the real WOS definition and 01.01 source; fixtures add lessons through metadata only.
const wos0201 = "content/courses/worldbuilding-operating-system/module-02-creative-seeds-world-premise/02-01-what-is-a-creative-seed.mdx";
const writeSource = (base, relative, source) => {
  fs.mkdirSync(path.dirname(path.join(base, relative)), { recursive: true });
  fs.writeFileSync(path.join(base, relative), source);
};
function wosFixture(t) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "lms-course-test-"));
  t.after(() => {
    assert.ok(path.basename(base).startsWith("lms-course-test-"));
    fs.rmSync(base, { recursive: true, force: true });
  });
  writeSource(base, wos0101, fs.readFileSync(path.join(root, wos0101), "utf8"));
  const course = wosCourse();
  const inputs = {
    catalog: [{ course, resources: [] }], paths: [], publicCourseSlugs: [], publicPathSlugs: [],
    legacyRegistry: { ...registry(), lesson_count: 0 },
    additionsRegistry: registry(catalogInputs(root).additionsRegistry.records.filter((r) => r.source_path === wos0101)),
    denylist: { schema_version: 1, denied: [] },
  };
  return { base, inputs, course };
}

test("a future lesson 02.01 is authored with one MDX file, one identity and one module entry", async (t) => {
  const { base, inputs, course } = wosFixture(t);
  writeSource(base, wos0201, lessonSource("What Is a Creative Seed?", "draft")
    .replace('tags: ["testing"]', 'tags: ["testing"]\nmedia:\n  video:\n    provider: "youtube"\n    videoId: "Fixture0201"'));
  inputs.additionsRegistry.records.push({ lesson_id: "test-wos-0201", source_path: wos0201,
    legacy_route: "/courses/worldbuilding-operating-system/lessons/02-01-what-is-a-creative-seed" });
  course.modules[1].lessonSlugs.push("02-01-what-is-a-creative-seed");
  const result = await compileCatalog(base, inputs);
  const lesson = result.allLessons.find((l) => l.id === "test-wos-0201");
  assert.equal(lesson.sourcePath, wos0201);
  assert.equal(lessonSourcePath(course.slug, course.modules[1].directory, lesson.slug), wos0201);
  assert.deepEqual(lesson.media, { video: { provider: "youtube", videoId: "Fixture0201" } });
  assert.equal(result.publicLessons.length, 0);
});

test("a missing module-first source still fails closed", async (t) => {
  const { base, inputs } = wosFixture(t);
  fs.unlinkSync(path.join(base, wos0101));
  await assert.rejects(compileCatalog(base, inputs), /Missing registered source: content\/courses\/worldbuilding-operating-system\/module-01/);
});

const retire = (lesson_id) => registry([{ lesson_id, disposition: "retired", reason: "Test retirement", last_source_commit: "a".repeat(40) }]);
for (const [name, mutate, diagnostic] of [
  ["unregistered MDX in a module directory", (base) => writeSource(base, wos0201, lessonSource()),
    /orphan lesson file module-02-creative-seeds-world-premise\/02-01-what-is-a-creative-seed\.mdx/],
  ["lesson content in an undeclared lessons/ root", (base) => writeSource(base,
    "content/courses/worldbuilding-operating-system/lessons/01-01-what-is-worldbuilding.mdx", lessonSource()),
  /content outside a declared module directory: lessons/],
  ["second copy of a lesson in another module", (base) => writeSource(base,
    "content/courses/worldbuilding-operating-system/module-02-creative-seeds-world-premise/01-01-what-is-worldbuilding.mdx",
    fs.readFileSync(path.join(base, wos0101), "utf8")), /orphan lesson file/],
  ["02.01 claiming Module 01", (_base, _inputs, course) => course.modules[0].lessonSlugs.push("02-01-what-is-a-creative-seed"),
    /cannot belong to module 01/],
  ["file name drifting from the syllabus title", (_base, _inputs, course) => course.modules[1].lessonSlugs.push("02-01-what-is-creative-seeds"),
    /planned lesson number plus its title slug/],
  ["module directory drifting from its title", (_base, _inputs, course) => { course.modules[1].directory = "module-02-creative-seeds"; },
    /directory must be module-02-creative-seeds-world-premise/],
  ["planned lessons in an unnumbered directory", (_base, _inputs, course) => { course.modules[1].directory = "lessons"; },
    /planned lessons require a numbered module directory/],
  ["traversal-shaped module directory", (_base, _inputs, course) => { course.modules[1].directory = "../module-02-escape"; },
    /must match pattern/],
  ["duplicate module number", (_base, _inputs, course) => course.modules.push({ ...course.modules[0], id: "dup", slug: "dup", lessonSlugs: [] }),
    /module numbers: duplicate 01/],
  ["retired identity claimed by a module", (_base, inputs) => { inputs.lifecycle = retire("lms-lesson-0032"); },
    /Retired lesson identity cannot be active/],
  ["lifecycle record for an unknown ID", (_base, inputs) => { inputs.lifecycle = retire("unknown-id"); }, /unregistered lesson ID: unknown-id/],
]) {
  test(`module-first authoring fails closed: ${name}`, async (t) => {
    const { base, inputs, course } = wosFixture(t);
    mutate(base, inputs, course);
    await assert.rejects(compileCatalog(base, inputs), diagnostic);
  });
}

test("an identity migrates to a module directory only through an explicit record, keeping ID and route", async (t) => {
  const { base, inputs } = fixture(t);
  const target = "content/courses/course-a/module-01-basics/01-introduction.mdx";
  const [foundations] = inputs.catalog[0].course.modules;
  inputs.catalog[0].course.modules = [{ ...foundations, lessonSlugs: ["02-second"] },
    { id: "module-basics", slug: "basics", title: "Basics", summary: "Basics", directory: "module-01-basics", lessonSlugs: ["01-introduction"] }];
  writeSource(base, target, fs.readFileSync(path.join(base, "content/courses/course-a/lessons/01-introduction.mdx"), "utf8"));
  fs.unlinkSync(path.join(base, "content/courses/course-a/lessons/01-introduction.mdx"));
  await assert.rejects(compileCatalog(base, inputs), /Unregistered stable identity/);
  inputs.lifecycle = registry([{ lesson_id: "test-a-intro", disposition: "migrated", current_source_path: target.replace("01-introduction", "01-renamed") }]);
  await assert.rejects(compileCatalog(base, inputs), /Migration must keep course and lesson slug/);
  inputs.lifecycle = registry([{ lesson_id: "test-a-intro", disposition: "migrated", current_source_path: target }]);
  const result = await compileCatalog(base, inputs);
  assert.equal(result.allLessons.find((l) => l.id === "test-a-intro").sourcePath, target);
  assert.ok(createCourseQueries(result.publicData).getLessonRouteParams()
    .some((p) => p.slug === "course-a" && p.lesson === "01-introduction"), "route identity unchanged");
});

const pinnedSvg = `https://cdn.jsdelivr.net/gh/Reltroner/lms-reltroner-resource@${"a".repeat(40)}/courses/future/diagram.svg`;
for (const [name, markdown, cause] of [
  ["unapproved host", "![A future lesson diagram](https://evil.example/diagram.svg)", /pinned approved CDN asset/],
  ["mutable CDN branch", "![A future lesson diagram](https://cdn.jsdelivr.net/gh/Reltroner/lms-reltroner-resource@main/x/diagram.svg)", /pinned approved CDN asset/],
  ["unapproved CDN repository", `![A future lesson diagram](${pinnedSvg.replace("Reltroner/lms-reltroner-resource", "attacker/resource")})`, /pinned approved CDN asset/],
  ["CDN path traversal", `![A future lesson diagram](${pinnedSvg.replace("courses/future", "courses/../..")})`, /pinned approved CDN asset/],
  ["non-image asset", `![A future lesson diagram](${pinnedSvg.replace(".svg", ".pdf")})`, /pinned approved CDN asset/],
  ["script URL", "![A future lesson diagram](javascript:alert(1))", /pinned approved CDN asset/],
  ["missing local image", "![A future lesson diagram](/images/lessons/missing.svg)", /not found in public/],
  ["missing alt text", `![](${pinnedSvg})`, /alt text/],
  ["reference-style image", `![A future lesson diagram][d]\n\n[d]: ${pinnedSvg}`, /inline/],
]) {
  test(`lesson images fail closed: ${name}`, async (t) => {
    const { base, inputs } = fixture(t);
    fs.writeFileSync(path.join(base, "content/courses/course-a/lessons/01-introduction.mdx"), `${lessonSource()}\n${markdown}\n`);
    await assert.rejects(compileCatalog(base, inputs), (error) => {
      assert.match(error.message, /MDX compilation failed/);
      assert.match(String(error.cause?.message), cause);
      return true;
    });
  });
}

test("future lessons add pinned CDN or existing public diagrams through Markdown alone", async (t) => {
  const { base, inputs } = fixture(t);
  fs.mkdirSync(path.join(base, "public/images"), { recursive: true });
  fs.writeFileSync(path.join(base, "public/images/local.svg"), "<svg xmlns='http://www.w3.org/2000/svg'/>");
  fs.writeFileSync(path.join(base, "content/courses/course-a/lessons/01-introduction.mdx"),
    `${lessonSource()}\n![A pinned diagram for a future lesson](${pinnedSvg})\n\n![A local diagram](/images/local.svg)\n`);
  const { code } = (await compileCatalog(base, inputs)).allLessons.find((l) => l.id === "test-a-intro");
  assert.ok(code.includes(pinnedSvg) && code.includes("/images/local.svg"));
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
    { id: "later", slug: "later", title: "Later", summary: "Later module", directory: "lessons", lessonSlugs: ["01-introduction"] },
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
  assert.equal(after.allLessons.length, before.allLessons.length + slugs.length);
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
  const routes = ["", "courses", "paths", "search", "my-learning", "ai", "about",
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
