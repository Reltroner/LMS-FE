import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const baseline = path.resolve(".course-baseline");
assert.ok(fs.existsSync(path.join(baseline, "hashes.json")), "Original worktree baseline is required");
const originalHashes = JSON.parse(fs.readFileSync(path.join(baseline, "hashes.json"), "utf8"));
const lifecycle = JSON.parse(fs.readFileSync("contracts/catalog/lesson-id-lifecycle.json", "utf8"));
const legacyRegistry = JSON.parse(fs.readFileSync("contracts/catalog/lesson-id-registry.json", "utf8"));

// Verify historical baseline HTML snapshots in .course-baseline/ remain present and non-empty
const baselineHtmlFiles = fs
  .readdirSync(baseline, { recursive: true })
  .map(String)
  .filter((file) => file.endsWith(".html"));
assert.equal(baselineHtmlFiles.length, 10, "Historical baseline HTML archive must remain intact");

const retiredIds = new Set(
  lifecycle.records.filter((r) => r.disposition === "retired").map((r) => r.lesson_id),
);
const retiredLessonPaths = new Set(
  legacyRegistry.records.filter((r) => retiredIds.has(r.lesson_id)).map((r) => r.source_path),
);

const authorizedLifecycleTransitions = new Set([
  "src/app/courses/page.tsx",
  "src/app/paths/page.tsx",
  "project-architecture.txt",
  "content/courses/backend-engineering/author/course-notes.md",
  "content/courses/backend-engineering/resources/README.md",
  "contracts/catalog/unpublished-route-denylist.json",
  // Redesigned by ai-agent-spec/RELTRONER_LEARNING_PRODUCTION_UIUX_BLUEPRINT_v1.1 (global navbar with
  // Contact/Ecosystem/Ctrl+K, editorial Search page, honest mentorship availability).
  "src/components/layout/Header.tsx",
  "src/app/search/page.tsx",
  "src/app/mentorship/page.tsx",
  ...retiredLessonPaths,
]);

let intact = 0;
for (const [file, hash] of Object.entries(originalHashes)) {
  const normalized = file.replaceAll("\\", "/");
  if (authorizedLifecycleTransitions.has(normalized)) continue;
  assert.ok(fs.existsSync(file), `Active baseline-tracked file missing: ${file}`);
  const actual = createHash("sha256").update(fs.readFileSync(file)).digest("hex");
  assert.equal(actual, hash, `Unrelated work/source changed: ${file}`);
  intact++;
}

// Verify retired backend routes stay absent from out/
const retiredExportRoutes = [
  "courses/backend-engineering/index.html",
  "courses/backend-engineering/lessons/01-http-overview/index.html",
  "courses/backend-engineering/lessons/02-http-methods/index.html",
  "courses/backend-engineering/lessons/03-rest-introduction/index.html",
  "paths/full-stack-backend-engineer/index.html",
];
for (const retiredRoute of retiredExportRoutes) {
  assert.ok(
    !fs.existsSync(path.join("out", retiredRoute)),
    `Retired route must stay absent from out/: ${retiredRoute}`,
  );
}

// Verify current approved public routes and landmarks
const activeExportRoutes = [
  "index.html",
  "courses/index.html",
  "courses/worldbuilding-operating-system/index.html",
  "courses/worldbuilding-operating-system/lessons/01-01-what-is-worldbuilding/index.html",
  "paths/index.html",
  "paths/worldbuilding-operating-system/index.html",
  "search/index.html",
  "ai/index.html",
  "about/index.html",
  "mentorship/index.html",
  "my-learning/index.html",
  "404.html",
];

const count = (html, pattern) => html.match(pattern)?.length ?? 0;

for (const route of activeExportRoutes) {
  const fullPath = path.join("out", route);
  assert.ok(fs.existsSync(fullPath), `Missing active exported route: ${route}`);
  const html = fs.readFileSync(fullPath, "utf8");
  assert.ok(html.includes("<main"), `Missing <main> landmark in ${route}`);
  assert.ok(html.includes("</main>"), `Missing </main> closing tag in ${route}`);

  // Blueprint v1.1 shell (replaces the frozen pre-redesign header/footer snapshots): skip link,
  // one header with external Contact and an Ecosystem disclosure, one main, then exactly one
  // newsletter immediately before exactly one footer.
  assert.ok(html.includes('href="#main-content"'), `Missing skip link in ${route}`);
  assert.equal(count(html, /<header\b/g), 1, `Expected one header in ${route}`);
  assert.equal(count(html, /<main\b/g), 1, `Expected one main landmark in ${route}`);
  assert.equal(count(html, /<footer\b/g), 1, `Expected one footer in ${route}`);
  assert.equal(count(html, /aria-labelledby="newsletter-heading"/g), 1, `Expected one newsletter in ${route}`);
  const header = html.match(/<header[\s\S]*?<\/header>/)?.[0] ?? "";
  assert.ok(header.includes('href="https://www.reltroner.com/contact" target="_blank" rel="noopener noreferrer"'),
    `Contact must be the external Studio page in ${route}`);
  assert.match(header, /<button[^>]*aria-expanded="false"[^>]*>Ecosystem/, `Ecosystem disclosure missing in ${route}`);
  assert.ok(!header.includes('href="/admin'), `Header must not advertise Admin in ${route}`);
  const afterMain = html.slice(html.indexOf("</main>"));
  const newsletterAt = afterMain.indexOf('aria-labelledby="newsletter-heading"');
  const footerAt = afterMain.indexOf("<footer");
  assert.ok(newsletterAt > 0 && footerAt > newsletterAt, `Newsletter must follow main and precede the footer in ${route}`);
  assert.ok(!afterMain.slice(newsletterAt, footerAt).includes("<section"), `Nothing may sit between newsletter and footer in ${route}`);
  const footer = html.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? "";
  assert.ok(footer.includes("Systems thinking, worldbuilding methodology, and creative constraints for independent creators."),
    `Footer brand statement missing in ${route}`);
}

// The legacy assistant route only redirects to the AI Guide.
const assistantRedirect = fs.readFileSync(path.join("out", "assistant/index.html"), "utf8");
assert.match(assistantRedirect, /http-equiv="refresh" content="\d+;url=\/ai\/"/, "Legacy /assistant/ must redirect to /ai/");

// Verify WOS course catalog & detail page
const coursesHtml = fs.readFileSync(path.join("out", "courses/index.html"), "utf8");
assert.ok(coursesHtml.includes("Worldbuilding Operating System"), "WOS course card must appear in /courses");
assert.ok(!coursesHtml.includes("In-World Living Lab"), "Draft In-World Living Lab must not appear in /courses");

const wosCourseHtml = fs.readFileSync(
  path.join("out", "courses/worldbuilding-operating-system/index.html"),
  "utf8",
);
assert.ok(wosCourseHtml.includes("Worldbuilding Fundamentals"), "WOS course page must display Module 1");
assert.ok(wosCourseHtml.includes("What Is Worldbuilding?"), "WOS course page must list Lesson 01.01");

// Verify WOS learning path page
const pathsHtml = fs.readFileSync(path.join("out", "paths/index.html"), "utf8");
assert.ok(pathsHtml.includes("Worldbuilding Operating System"), "WOS path must appear in /paths");

// Verify WOS 01.01 lesson reader page structure, objectives, outputs, media switcher, and diagrams
const wosLessonHtml = fs.readFileSync(
  path.join("out", "courses/worldbuilding-operating-system/lessons/01-01-what-is-worldbuilding/index.html"),
  "utf8",
);
assert.ok(wosLessonHtml.includes('<div class="prose-reltroner max-w-none">'), "Missing lesson prose wrapper");
assert.ok(wosLessonHtml.includes("Learning objectives"), "Missing Learning objectives section");
assert.ok(wosLessonHtml.includes("Expected outputs"), "Missing Expected outputs section");
assert.ok(wosLessonHtml.includes('aria-label="Lesson formats"'), "Missing LessonMediaSwitcher tablist");
assert.ok(wosLessonHtml.includes('aria-label="Lesson navigation"'), "Missing lesson navigation landmark");
for (const svg of ["01-01-idea-to-world.svg", "01-01-four-questions.svg", "01-01-fact-to-consequence.svg"]) {
  assert.ok(wosLessonHtml.includes(svg), `Missing pinned SVG diagram ${svg} in exported lesson`);
}

// Verify Search and Assistant accessibility landmarks
const searchHtml = fs.readFileSync(path.join("out", "search/index.html"), "utf8");
assert.ok(searchHtml.includes('aria-label="Search"'), "Missing accessible search input on /search");

const assistantHtml = fs.readFileSync(path.join("out", "ai/index.html"), "utf8");
assert.ok(assistantHtml.includes('aria-label="Ask the assistant"'), "Missing accessible assistant input on /ai");

console.log(
  `UI_STRUCTURE = PASS: ${activeExportRoutes.length} active exported pages verified; ${retiredExportRoutes.length} retired routes absent; ${intact} original source files byte-identical`,
);
