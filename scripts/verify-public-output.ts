import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileCatalog, type CatalogInputs } from "../src/lib/content/compiler.ts";
import { createCourseQueries } from "../src/lib/content/queries.ts";
import { catalogInputs } from "./catalog-inputs.ts";

function readable(value: string) {
  return value.replace(/\\u([0-9a-f]{4})/gi, (_, digits: string) => String.fromCharCode(parseInt(digits, 16)))
    .replace(/\\\//g, "/").replace(/\\"/g, '"')
    .replace(/&amp;/g, "&").replace(/&quot;|&#34;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

export async function verifyPublicOutput(root: string, inputs: CatalogInputs = catalogInputs(root), output = path.join(root, "out")) {
  if (!fs.existsSync(output)) throw new Error("Missing static export out/");
  const compiled = await compileCatalog(root, inputs);
  const q = createCourseQueries(compiled.publicData);
  const courseRoutes = q.getCourseRouteParams().map((p) => `/courses/${p.slug}`);
  const lessonRoutes = q.getLessonRouteParams().map((p) => `/courses/${p.slug}/lessons/${p.lesson}`);
  const pathRoutes = q.getPublishedPaths().map((p) => `/paths/${p.slug}`);
  const required = new Set([
    "/", "/courses", "/paths", "/search", "/my-learning",
    ...courseRoutes,
    ...lessonRoutes,
    ...pathRoutes,
  ]);
  for (const route of required) {
    const relative = route === "/" ? "index.html" : `${route.slice(1)}/index.html`;
    if (!fs.existsSync(path.join(output, relative))) throw new Error(`Missing public route: ${route}`);
  }
  const publicIds = new Set(compiled.publicLessons.map((l) => l.id));
  const privateCourses = compiled.entries.filter((e) => !q.getCourseBySlug(e.course.slug));
  const privatePaths = compiled.paths.filter((p) => !q.getPathBySlug(p.slug));
  const privateLessons = compiled.allLessons.filter((l) => !publicIds.has(l.id));
  const publicText = JSON.stringify(compiled.publicData) + compiled.publicLessons.map((l) => l.body).join("\n");
  const needles = new Set<string>();
  for (const { course, resources } of privateCourses) {
    [course.title, `/courses/${course.slug}`, ...(course.aliases ?? []).map((s) => `/courses/${s}`),
      ...resources.map((r) => r.id)].forEach((value) => needles.add(value));
  }
  for (const p of privatePaths) [p.title, `/paths/${p.slug}`].forEach((value) => needles.add(value));
  for (const lesson of privateLessons) {
    needles.add(lesson.id);
    needles.add(`/courses/${lesson.courseSlug}/lessons/${lesson.slug}`);
    const snippets = [lesson.title, lesson.summary, ...lesson.objectives, ...lesson.outputs,
      ...lesson.body.split(/\n\s*\n/).filter((p) => p.length >= 48 && !/^[#<*\-]/.test(p))];
    for (const snippet of snippets) {
      if (snippet.length >= 10 && !publicText.includes(snippet)) needles.add(snippet);
    }
  }
  const denylist = inputs.denylist as { denied: { route: string; title: string }[] };
  denylist.denied.forEach((d) => { needles.add(d.route); needles.add(d.title); });
  let count = 0;
  const failures: string[] = [];
  function walk(directory: string) {
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, item.name);
      if (item.isSymbolicLink()) throw new Error(`Symlink in public export: ${file}`);
      if (item.isDirectory()) { walk(file); continue; }
      const relative = path.relative(output, file).replaceAll(path.sep, "/");
      const route = relative.endsWith("/index.html") ? `/${relative.slice(0, -11)}` : undefined;
      if (route && /^\/(courses|paths)\//.test(route) && !required.has(route) && !route.endsWith("/_empty")) {
        failures.push(`Unapproved generated route: ${route}`);
      }
      const content = readable(fs.readFileSync(file).toString("utf8"));
      for (const needle of needles) {
        if (content.includes(readable(needle)) || relative.includes(needle)) {
          failures.push(`Private content in ${relative}: ${needle.slice(0, 90)}`);
        }
      }
      count++;
    }
  }
  walk(output);
  if (failures.length) throw new Error(`Public output privacy verification failed:\n${failures.slice(0, 20).join("\n")}`);
  return { files: count, needles: needles.size, routes: required.size };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await verifyPublicOutput(process.cwd());
    console.log(`PUBLIC_OUTPUT_PRIVACY = PASS: ${result.files} assets, ${result.needles} restricted markers, ${result.routes} required routes`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
