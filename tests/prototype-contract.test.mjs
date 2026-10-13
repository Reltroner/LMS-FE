import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("PX-01 static Pages export", () => {
  const config = read("next.config.ts");
  assert.match(config, /output:\s*["']export["']/);
  assert.match(config, /images:\s*\{\s*unoptimized:\s*true/);
});
test("PX-02 public courses exclude synthetic fixtures", () => {
  const s = read("src/lib/fixtures/courses.ts");
  assert.match(s, /getPublishedCourses[\s\S]*?c\.status\s*===\s*"published"\s*&&\s*c\.isSynthetic\s*!==\s*true/);
  assert.match(s, /slug:\s*"backend-engineering"[\s\S]*?status:\s*"published"[\s\S]*?isSynthetic:\s*false/);
  assert.match(s, /slug:\s*"api-design-patterns"[\s\S]*?isSynthetic:\s*true/);
});
test("PX-03 public learning path excludes synthetic course references", () => {
  const s = read("src/lib/fixtures/paths.ts");
  const published = s.split('slug: "full-stack-backend-engineer"')[1]?.split('slug: "worldbuilding-creator"')[0];
  assert.ok(published);
  assert.match(published, /status:\s*"published"/);
  assert.match(published, /courseSlugs:\s*\["backend-engineering"\]/);
  assert.doesNotMatch(published, /api-design-patterns|deployment-and-operations/);
});
test("PX-04 static route enumerators require publication filtering", () => {
  for (const [file, symbol] of [
    ["src/app/courses/[slug]/page.tsx", "getPublishedCourses"],
    ["src/app/paths/[slug]/page.tsx", "getPublishedPaths"],
  ]) {
    const s = read(file);
    assert.ok(s.includes(symbol), file);
    assert.match(s, /dynamicParams\s*=\s*false/);
  }
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

// WARNING: Prototype-only CI. Does NOT replace prior 19 Phase3B
// Contentlayer publication negative tests or certify real OIDC/backend.
