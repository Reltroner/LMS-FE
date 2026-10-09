import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileManifest } from "./phase3b-catalog.mjs";

const root = process.cwd();

export function normalizeToLF(source) {
  if (typeof source !== "string") throw new TypeError("Expected string content for normalization");
  return source.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function preparePublicContent(base = root) {
  const staging = path.join(base, ".public-content");
  const sourceContent = path.join(base, "content");
  if (path.dirname(staging) !== base || path.basename(staging) !== ".public-content") {
    throw new Error("Refuse unsafe staging target");
  }
  const compiled = compileManifest(base);
  const allowed = new Set(compiled.manifest.lessons.map((x) => x.lesson_id));
  const published = compiled.allLessons.filter((x) => x.status === "published");
  if (published.length !== allowed.size) throw new Error("Published manifest identity mismatch");
  fs.rmSync(staging, { recursive: true, force: true });
  let count = 0;
  for (const l of published) {
    if (!allowed.has(l.lesson_id)) throw new Error("Unlisted public lesson");
    const src = path.join(base, l.source_path);
    const meta = fs.lstatSync(src);
    if (!meta.isFile() || meta.isSymbolicLink())
      throw new Error("Only regular source files allowed");
    const rel = path.relative(sourceContent, src);
    if (rel.startsWith("..") || path.isAbsolute(rel)) throw new Error("Path escapes content");
    const out = path.join(staging, rel);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const content = fs.readFileSync(src, "utf8");
    const normalized = normalizeToLF(content);
    fs.writeFileSync(out, normalized, { encoding: "utf8", flag: "wx" });
    count++;
  }
  if (count !== compiled.manifest.lesson_count) throw new Error("Public staging count mismatch");
  return { count, total: compiled.allLessons.length };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()
) {
  const { count, total } = preparePublicContent(root);
  console.log(
    "Public Contentlayer staged lessons:",
    count,
    "of",
    total,
    "source MDX; draft/archived excluded",
  );
}
