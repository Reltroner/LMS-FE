import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const registryPath = path.join(root, "contracts/catalog/lesson-id-registry.json");

export function stableJSONString(value) {
  if (Array.isArray(value)) return "[" + value.map(stableJSONString).join(",") + "]";
  if (value && typeof value === "object") {
    return "{" + Object.keys(value).sort().map((key) =>
      JSON.stringify(key) + ":" + stableJSONString(value[key])).join(",") + "}";
  }
  return JSON.stringify(value);
}
export const digest = (s) => crypto.createHash("sha256").update(s).digest("hex");

export function frontmatter(source) {
  const match = source.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) throw new Error("MDX missing frontmatter");
  const find = (key) => {
    const m = match[1].match(new RegExp("^" + key + ":\\s*(.*)$", "m"));
    if (!m) throw new Error("Missing frontmatter " + key);
    return m[1].trim().replace(/^["']|["']$/g, "");
  };
  const status = find("status");
  if (!["draft","published","archived"].includes(status)) throw new Error("Unrecognized status " + status);
  return {status, title:find("title"), summary:find("summary")};
}

export function compileManifest(base=root, sourceRegistry) {
  const reg = sourceRegistry ?? JSON.parse(fs.readFileSync(path.join(base, "contracts/catalog/lesson-id-registry.json"), "utf8"));
  if (reg.records.length !== 31) throw new Error("Expected audited 31 lesson mapping");
  const ids = new Set(), files = new Set(), lessons = [];
  for (const entry of reg.records) {
    if (!/^lms-lesson-\d{4}$/.test(entry.lesson_id) || ids.has(entry.lesson_id)) throw new Error("Invalid/duplicate stable ID");
    if (!/^content\/courses\/[a-z0-9-]+\/lessons\/[a-z0-9-]+\.mdx$/.test(entry.source_path) || files.has(entry.source_path)) throw new Error("Invalid/duplicate path");
    ids.add(entry.lesson_id); files.add(entry.source_path);
    const file = path.join(base, entry.source_path);
    if (!fs.existsSync(file)) throw new Error("Missing registered lesson " + entry.source_path);
    const lesson = frontmatter(fs.readFileSync(file, "utf8"));
    const [,courseSlug,lessonSlug] = entry.source_path.match(/^content\/courses\/([^/]+)\/lessons\/([^/]+)\.mdx$/);
    const url = "/courses/" + courseSlug + "/lessons/" + lessonSlug;
    if (entry.legacy_route !== url) throw new Error("Legacy route mismatch, require explicit versioned redirect migration");
    lessons.push({lesson_id:entry.lesson_id,course_id:courseSlug,source_path:entry.source_path,route:url,status:lesson.status,title:lesson.title,summary:lesson.summary});
  }
  lessons.sort((a,b)=>a.lesson_id.localeCompare(b.lesson_id));
  const published = lessons.filter(x=>x.status==="published");
  const publicLessons = published.map(({lesson_id,course_id,route,title,summary})=>({lesson_id,course_id,route,title,summary}));
  const group = {};
  for (const lesson of publicLessons) (group[lesson.course_id]??=[]).push(lesson);
  const courseRevisions = Object.fromEntries(Object.keys(group).sort().map(course => [course, digest(stableJSONString(group[course]))]));
  const manifest = {schema_version:1,source:"git-lms-catalog",public_only:true,lesson_count:publicLessons.length,course_revisions:courseRevisions,lessons:publicLessons};
  return {manifest,hash:digest(stableJSONString(manifest)),allLessons:lessons};
}
export function validateStudioAttestation(doc) {
  return doc && doc.publisher==="reltroner-studio" && doc.published===true &&
    doc.rights==="public-redistribution-allowed" &&
    typeof doc.source_commit_sha==="string" && /^[a-f0-9]{40}$/.test(doc.source_commit_sha) &&
    typeof doc.digest_sha256==="string" && /^[a-f0-9]{64}$/.test(doc.digest_sha256);
}
export function scanPublicOutput(base, compiled, relative="out") {
  const target = path.join(base,relative);
  if (!fs.existsSync(target)) throw new Error("Missing build output: "+target);
  const drafts=compiled.allLessons.filter(x=>x.status!=="published");
  const bad = [];
  const publishedText=new Set(compiled.allLessons.filter(x=>x.status==="published").flatMap(x=>[x.title,x.summary]));
  const denyList = JSON.parse(fs.readFileSync(path.join(base,"contracts/catalog/unpublished-route-denylist.json"),"utf8")).denied;
  const tokens=[...new Set([
    ...drafts.flatMap(x=>[x.route,x.lesson_id,
      ...[x.title,x.summary].filter(s=>s.length>=14&&!publishedText.has(s))
    ]),
    ...denyList.flatMap(x=>[x.route,x.title])
  ])]; // fail closed for unpublished lesson/course/path route and public metadata
  const walk = p => { for (const x of fs.readdirSync(p,{withFileTypes:true})) {
    const abs=path.join(p,x.name);if(x.isDirectory()){walk(abs);continue;}
    const rel=path.relative(target,abs).replaceAll(path.sep,"/");
    if (!/\.(?:html|xml|json|js|txt)$/.test(rel)) continue;
    const content=fs.readFileSync(abs,"utf8");
    for (const t of tokens) if(content.includes(t))bad.push({artifact:rel,token:t});
  }};
  walk(target);
  return bad;
}
if (process.argv[1] && path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/,"$1"))) {
  const compiled=compileManifest();
  console.log(stableJSONString({manifest:compiled.manifest,sha256:compiled.hash}));
  if(process.argv.includes("--verify-out")){
    const errors=scanPublicOutput(root,compiled);
    if(errors.length){console.error(JSON.stringify(errors.slice(0,20)));process.exitCode=1;}
  }
}
