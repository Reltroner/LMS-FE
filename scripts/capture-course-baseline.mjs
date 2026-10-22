import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const baseline = ".course-baseline";
if (fs.existsSync(path.join(baseline, "hashes.json"))) {
  throw new Error("Baseline already captured; refusing to replace original evidence");
}
const routes = [
  "index.html", "courses/index.html", "courses/backend-engineering/index.html",
  ...["01-http-overview", "02-http-methods", "03-rest-introduction"].map(
    (slug) => `courses/backend-engineering/lessons/${slug}/index.html`,
  ),
  "paths/index.html", "paths/full-stack-backend-engineer/index.html",
  "search/index.html", "my-learning/index.html",
];
for (const route of routes) {
  const dest = path.join(baseline, route);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join("out", route), dest);
}
const files = [
  "src/app/courses/page.tsx", "src/app/mentorship/page.tsx",
  "src/app/paths/page.tsx", "src/app/search/page.tsx",
  "src/components/layout/Header.tsx", "project-architecture.txt",
  ...fs.readdirSync("content", { recursive: true }).map(String)
    .map((file) => path.join("content", file)).filter((file) => fs.statSync(file).isFile()),
  ...fs.readdirSync("contracts/catalog").map((file) => path.join("contracts/catalog", file)),
];
const hashes = Object.fromEntries(files.map((file) => [
  file, createHash("sha256").update(fs.readFileSync(file)).digest("hex"),
]));
fs.writeFileSync(path.join(baseline, "hashes.json"), JSON.stringify(hashes, null, 2));
console.log(`Captured ${routes.length} HTML pages and ${files.length} source hashes`);
