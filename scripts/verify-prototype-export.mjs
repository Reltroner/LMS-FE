import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const output = path.join(process.cwd(), "out");
const required = [
  "index.html",
  "courses/index.html",
  "courses/backend-engineering/index.html",
  "courses/backend-engineering/lessons/01-http-overview/index.html",
  "paths/index.html",
  "paths/full-stack-backend-engineer/index.html",
];
const excluded = [
  "courses/worldbuilding-operating-system/index.html",
  "courses/in-world-living-lab/index.html",
  "courses/api-design-patterns/index.html",
  "courses/deployment-and-operations/index.html",
  "paths/worldbuilding-creator/index.html",
];
const prohibited = [
  "Worldbuilding Operating System", "In-World Living Lab",
  "Worldbuilding Creator Path", "API Design Patterns",
  "Deployment & Operations",
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
  for (const term of prohibited) {
    assert.ok(!html.includes(term), "Unpublished/mocked metadata found: " + relative + " / " + term);
  }
}
console.log("PROTOTYPE_STATIC_EXPORT_SCOPE = PASS");
console.log("NOT CERTIFIED: prior Phase3B Contentlayer MDX negative contract, entire JS bundle, or real OIDC.");
