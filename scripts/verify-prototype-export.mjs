import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const output = path.join(process.cwd(), "out");
const required = [
  "index.html",
  "courses/index.html",
  "courses/worldbuilding-operating-system/index.html",
  "courses/worldbuilding-operating-system/lessons/01-01-what-is-worldbuilding/index.html",
  "paths/index.html",
  "paths/worldbuilding-operating-system/index.html",
  "search/index.html",
  "assistant/index.html",
];
// Draft courses and retired demo offerings (see contracts/catalog/lesson-id-lifecycle.json).
const excluded = [
  "courses/in-world-living-lab/index.html",
  "courses/backend-engineering/index.html",
  "courses/backend-engineering/lessons/01-http-overview/index.html",
  "courses/api-design-patterns/index.html",
  "courses/deployment-and-operations/index.html",
  "paths/worldbuilding-creator/index.html",
  "paths/full-stack-backend-engineer/index.html",
];
const prohibited = [
  "In-World Living Lab",
  "Worldbuilding Creator Path",
  "API Design Patterns",
  "Deployment & Operations",
  "Backend Engineering Fundamentals",
];

assert.ok(fs.existsSync(output), "Missing static export out/");
for (const relative of required) {
  assert.ok(fs.existsSync(path.join(output, relative)), "Missing published route: " + relative);
}
for (const relative of excluded) {
  assert.ok(!fs.existsSync(path.join(output, relative)), "Unpublished/mocked route exposed: " + relative);
}
for (const relative of ["index.html", "courses/index.html", "paths/index.html"]) {
  const html = fs.readFileSync(path.join(output, relative), "utf8");
  assert.ok(html.includes("Worldbuilding Operating System"), "Expected published WOS in " + relative);
  for (const term of prohibited) {
    assert.ok(!html.includes(term), "Unpublished/mocked metadata found: " + relative + " / " + term);
  }
}
const lessonHtml = fs.readFileSync(
  path.join(output, "courses/worldbuilding-operating-system/lessons/01-01-what-is-worldbuilding/index.html"),
  "utf8",
);
assert.ok(lessonHtml.includes("What Is Worldbuilding?"), "Missing WOS 01.01 title in exported lesson HTML");
console.log("PROTOTYPE_STATIC_EXPORT_SCOPE = PASS");
console.log("NOT CERTIFIED: prior Phase3B Contentlayer MDX negative contract, entire JS bundle, or real OIDC.");
