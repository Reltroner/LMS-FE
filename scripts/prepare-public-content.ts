import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileCatalog, type CatalogInputs } from "../src/lib/content/compiler.ts";
import { buildKnowledgeIndex } from "../src/lib/knowledge/ingest.ts";
import { catalogInputs } from "./catalog-inputs.ts";

export async function preparePublicContent(root: string, inputs = catalogInputs(root)) {
  const compiled = await compileCatalog(root, inputs);
  const knowledgeIndex = buildKnowledgeIndex(compiled);
  const staging = path.resolve(root, ".public-content");
  if (path.dirname(staging) !== path.resolve(root) || path.basename(staging) !== ".public-content" ||
      (fs.existsSync(staging) && fs.lstatSync(staging).isSymbolicLink())) {
    throw new Error("Refuse unsafe public staging target");
  }
  // All validation completes before replacing exclusively compiler-owned output.
  fs.rmSync(staging, { recursive: true, force: true });
  fs.mkdirSync(staging);
  fs.writeFileSync(path.join(staging, "data.json"), JSON.stringify(compiled.publicData, null, 2) + "\n");
  fs.writeFileSync(path.join(staging, "knowledge-index.json"), JSON.stringify(knowledgeIndex, null, 2) + "\n");
  const imports: string[] = [];
  const bodies: string[] = [];
  for (const [index, lesson] of compiled.publicLessons.entries()) {
    const relative = `${lesson.courseSlug}/${lesson.slug}`;
    const sourceTarget = path.join(staging, "courses", lesson.courseSlug, "lessons", `${lesson.slug}.mdx`);
    const codeTarget = path.join(staging, "compiled", `${relative}.js`);
    fs.mkdirSync(path.dirname(sourceTarget), { recursive: true });
    fs.mkdirSync(path.dirname(codeTarget), { recursive: true });
    fs.writeFileSync(sourceTarget, lesson.source);
    fs.writeFileSync(codeTarget, lesson.code);
    imports.push(`import Lesson${index} from ${JSON.stringify(`./compiled/${relative}.js`)};`);
    bodies.push(`  ${JSON.stringify(relative)}: Lesson${index},`);
  }
  fs.writeFileSync(path.join(staging, "lesson-bodies.ts"), [
    "// Generated public-only MDX. Do not edit.", 'import "server-only";',
    'import type { MDXContent } from "mdx/types";', ...imports,
    "export const lessonBodies: Readonly<Record<string, MDXContent>> = {", ...bodies, "};", "",
  ].join("\n"));
  return { ...compiled, knowledgeIndex };
}

export async function validateContent(root: string, inputs?: CatalogInputs) {
  return compileCatalog(root, inputs ?? catalogInputs(root));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = process.argv.includes("--validate")
      ? await validateContent(process.cwd()) : await preparePublicContent(process.cwd());
    console.log(`Validated ${result.entries.length} courses, ${result.allLessons.length} MDX lessons; public: ${result.publicData.courses.length} courses, ${result.publicLessons.length} lessons, ${result.publicData.paths.length} paths`);
    if (result.withheldResources.length) {
      console.warn(`Withheld ${result.withheldResources.length} resources not pinned to an approved repository commit: ${result.withheldResources.map((r) => r.id).join(", ")}`);
    }
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
