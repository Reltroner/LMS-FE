import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { compileCatalog } from "../src/lib/content/compiler.ts";
import { createCourseQueries } from "../src/lib/content/queries.ts";
import { catalogInputs } from "../scripts/catalog-inputs.ts";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const { publicData } = await compileCatalog(root, catalogInputs(root));
const queries = createCourseQueries(publicData);

test("PX-01 static Pages export", () => {
  const config = read("next.config.ts");
  assert.match(config, /output:\s*["']export["']/);
  assert.match(config, /images:\s*\{\s*unoptimized:\s*true/);
});
test("PX-02 public courses exclude synthetic fixtures and retired IT offerings", () => {
  assert.deepEqual(queries.getPublishedCourses().map((c) => c.slug), []);
  assert.ok(queries.getPublishedCourses().every((c) => c.status === "published" && c.isSynthetic !== true));
  assert.equal(queries.getCourseBySlug("backend-engineering"), undefined);
  assert.equal(queries.getCourseBySlug("api-design-patterns"), undefined);
  assert.equal(queries.getCourseBySlug("deployment-and-operations"), undefined);
});
test("PX-03 public learning path excludes synthetic references and retired IT paths", () => {
  assert.equal(queries.getPathBySlug("full-stack-backend-engineer"), undefined);
  assert.equal(queries.getPathBySlug("worldbuilding-creator"), undefined);
  assert.deepEqual(queries.getPublishedPaths().map((p) => p.slug), []);
});
test("PX-04 static route enumerators require publication filtering", () => {
  for (const [file, symbol] of [
    ["src/app/courses/[slug]/page.tsx", "getCourseRouteParams"],
    ["src/app/paths/[slug]/page.tsx", "getPublishedPaths"],
  ]) {
    const s = read(file);
    assert.ok(s.includes(symbol), file);
    assert.match(s, /dynamicParams\s*=\s*false/);
  }
  assert.ok(queries.getCourseRouteParams().every((p) => queries.getCourseBySlug(p.slug)?.status === "published"));
  assert.ok(queries.getLessonRouteParams().every((p) => queries.getLessonBySlug(p.slug, p.lesson)?.status === "published"));
});
test("PX-05 mocked authentication is visibly labeled", () => {
  assert.match(read("src/components/layout/Header.tsx"), /Sign in \(prototype only/);
  assert.match(read("src/components/layout/PrototypeBanner.tsx"), /Design prototype/);
  assert.match(read("src/components/layout/PrototypeBanner.tsx"), /No real LMS API calls/);
});
test("PX-06 historical lesson IDs preserved (not a live MDX contract test)", () => {
  const r = JSON.parse(read("contracts/catalog/lesson-id-registry.json"));
  assert.equal(r.records.length, 31);
  assert.equal(new Set(r.records.map((x) => x.lesson_id)).size, 31);
});

test("PX-07 educational domain positioning reflects Systemic Creative Architect", () => {
  const home = read("src/app/page.tsx");
  assert.match(home, /Systemic Creative Architect/);
  assert.match(home, /Build Fictional Worlds That Keep Generating Possibilities/);
  assert.doesNotMatch(home, /Engineering Skills/);
  assert.doesNotMatch(home, /AI Skills/);
  assert.doesNotMatch(home, /Full Stack Backend Engineer/);

  const footer = read("src/components/layout/Footer.tsx");
  assert.match(footer, /Systems thinking, worldbuilding methodology, and creative constraints/);
  assert.doesNotMatch(footer, /backend engineering/i);

  const layout = read("src/app/layout.tsx");
  assert.match(layout, /Systemic Creative Architect/);
});

test("PX-08 Worldbuilding Operating System is configured as the sole target public path", () => {
  const inputs = catalogInputs(root);
  const wosPath = inputs.paths.find((p) => p.slug === "worldbuilding-operating-system");
  assert.ok(wosPath, "Sole intended path exists in catalog definitions");
  assert.equal(wosPath.title, "Worldbuilding Operating System");
  assert.deepEqual(wosPath.courseSlugs, ["worldbuilding-operating-system"]);
  assert.equal(inputs.paths.find((p) => p.slug === "full-stack-backend-engineer"), undefined);
  assert.equal(inputs.paths.find((p) => p.slug === "in-world-living-lab"), undefined);
});

// WARNING: Prototype-only CI. Does NOT replace prior 19 Phase3B
// Contentlayer publication negative tests or certify real OIDC/backend.
