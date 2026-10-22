import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const baseline = path.resolve(".course-baseline");
assert.ok(fs.existsSync(path.join(baseline, "hashes.json")), "Original worktree baseline is required");
const originalHashes = JSON.parse(fs.readFileSync(path.join(baseline, "hashes.json"), "utf8"));
const expectedContentEdits = new Set([
  "content/courses/backend-engineering/lessons/01-http-overview.mdx",
  "content/courses/backend-engineering/lessons/02-http-methods.mdx",
  "content/courses/worldbuilding-operating-system/lessons/00-course-orientation.mdx",
]);
let intact = 0;
for (const [file, hash] of Object.entries(originalHashes)) {
  if (expectedContentEdits.has(file.replaceAll("\\", "/"))) continue;
  const actual = createHash("sha256").update(fs.readFileSync(file)).digest("hex");
  assert.equal(actual, hash, `Unrelated work/source changed: ${file}`);
  intact++;
}

// Compare actual exported element/attribute sequences, excluding build scripts,
// textual content and the lesson body whose canonical MDX replaces fixture prose.
function main(html, lesson = false, current = false) {
  const start = html.indexOf("<main");
  assert.ok(start >= 0, "Missing main landmark");
  const end = html.indexOf("</main>", start);
  assert.ok(end >= 0, "Missing main closing tag");
  let markup = html.slice(start, end + 7);
  // Next's Suspense HTML carries resolved content in later hidden containers.
  for (const match of html.matchAll(/<div hidden id="S:[^"]*">/g)) {
    markup += divAt(html, match.index).markup;
  }
  if (lesson) {
    const bodyStart = markup.indexOf('<div class="prose-reltroner max-w-none">');
    assert.ok(bodyStart >= 0, "Missing existing lesson prose wrapper");
    const bodyEnd = divAt(markup, bodyStart).end;
    markup = markup.slice(0, bodyStart) + '<div class="prose-reltroner max-w-none"></div>' + markup.slice(bodyEnd);
    // Canonical HTTP Methods frontmatter has 3 objectives and 2 outputs;
    // its obsolete fixture had 2 and 1. Compare every repeated row's markup
    // and retain the list/container classes, allowing only this known editorial count.
    if (/<h1[^>]*>HTTP Methods<\/h1>/.test(html)) {
      for (const label of ["Learning objectives", "Expected outputs"]) {
        const labelAt = markup.indexOf(label);
        const listAt = markup.indexOf("<ul", labelAt);
        const listEnd = markup.indexOf("</ul>", listAt);
        assert.ok(labelAt >= 0 && listAt >= 0 && listEnd >= 0, `Missing ${label} list`);
        const list = markup.slice(listAt, listEnd + 5);
        const rows = [...list.matchAll(/<li[\s\S]*?<\/li>/g)].map(([row]) => row.replace(/>[^<]+</g, "><"));
        const expected = label === "Learning objectives" ? (current ? 3 : 2) : (current ? 2 : 1);
        assert.equal(rows.length, expected, `Unexpected editorial count: ${label}`);
        assert.ok(rows.every((row) => row === rows[0]), `${label} row presentation differs`);
        const normalizedList = list.slice(0, list.indexOf("<li")) + rows[0] + "</ul>";
        markup = markup.slice(0, listAt) + normalizedList + markup.slice(listEnd + 5);
      }
    }
  }
  return [...markup.matchAll(/<\/?[a-zA-Z][^>]*>/g)].map(([tag]) =>
    tag.replace(/\s(?:id|aria-describedby|aria-controls)="[^"]*"/g, ""));
}
function divAt(html, start) {
  let depth = 0;
  for (const token of html.slice(start).matchAll(/<div(?:\s[^>]*)?>|<\/div>/g)) {
    depth += token[0].startsWith("</") ? -1 : 1;
    if (depth === 0) {
      const end = start + token.index + token[0].length;
      return { end, markup: html.slice(start, end) };
    }
  }
  throw new Error("Unclosed exported div");
}
const routes = fs.readdirSync(baseline, { recursive: true }).map(String).filter((file) => file.endsWith(".html"));
for (const route of routes) {
  const before = fs.readFileSync(path.join(baseline, route), "utf8");
  const after = fs.readFileSync(path.join("out", route), "utf8");
  assert.deepEqual(main(after, route.includes("lessons"), true), main(before, route.includes("lessons")),
    `Presentation element/attribute sequence changed: ${route}`);
  for (const landmark of ["header", "footer"]) {
    const expression = new RegExp(`<${landmark}[\\s\\S]*?</${landmark}>`);
    assert.equal(after.match(expression)?.[0], before.match(expression)?.[0], `${landmark} changed: ${route}`);
  }
}
console.log(`UI_STRUCTURE = PASS: ${routes.length} exported page comparisons; ${intact} original source files byte-identical`);
console.log("Preserved element/class/interaction attributes, header and footer; canonical lesson-body text differs.");
console.log("Editorial comparison exception: HTTP Methods objectives 2 -> 3 and outputs 1 -> 2, with identical row markup/classes.");
console.log("VISUAL_BROWSER_CHECK = NOT RUN: this session exposes no apps or browser surfaces; no viewport/theme screenshots or browser interaction parity claimed.");
