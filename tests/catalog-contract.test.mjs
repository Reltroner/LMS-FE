import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import {compileManifest,stableJSONString,validateStudioAttestation,scanPublicOutput} from "../scripts/phase3b-catalog.mjs";
import {normalizeToLF,preparePublicContent} from "../scripts/prepare-public-content.mjs";

const root=process.cwd();
test("B3-AC13 31 immutable lesson IDs and no duplicate path", () => {
 const obj=compileManifest(root);
 assert.equal(obj.allLessons.length,31);
 assert.equal(new Set(obj.allLessons.map(x=>x.lesson_id)).size,31);
 assert.equal(new Set(obj.allLessons.map(x=>x.source_path)).size,31);
});
test("B3-AC14 manifest deterministic; course revision independent of global release hash", () => {
 const a=compileManifest(root),b=compileManifest(root);
 assert.equal(stableJSONString(a.manifest),stableJSONString(b.manifest));
 assert.equal(a.hash,b.hash);
 for(const rev of Object.values(a.manifest.course_revisions))assert.match(rev,/^[a-f0-9]{64}$/);
 assert.equal(a.manifest.public_only,true);
});
test("B3-AC15 no draft or archived material in public manifest",()=>{
 const a=compileManifest(root);
 const live=new Set(a.allLessons.filter(x=>x.status==="published").map(x=>x.lesson_id));
 assert.deepEqual(a.manifest.lessons.map(x=>x.lesson_id), [...live].sort());
 assert.ok(!a.manifest.lessons.some(x=>!live.has(x.lesson_id)));
});
test("B3-AC13 rename migration missing source fails rather than implicitly regenerating IDs",()=>{
 const r=JSON.parse(fs.readFileSync(path.join(root,"contracts/catalog/lesson-id-registry.json"),"utf8"));
 const c=structuredClone(r);
 c.records[0].source_path="content/courses/backend-engineering/lessons/does-not-exist.mdx";
 assert.throws(()=>compileManifest(root,c),/Missing registered lesson/);
});
test("B3-AC15 public output scanner rejects draft routes and does not report published paths",()=>{
 const result=compileManifest(root);const draft=result.allLessons.find(x=>x.status!=="published");
 assert.ok(draft,"Expected an unpublished lesson in source at frozen SHA");
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),"reltroner-catalog-"));
 try{
  fs.mkdirSync(path.join(dir,"out"));fs.writeFileSync(path.join(dir,"out/index.html"),"Public metadata no draft links");
  assert.equal(scanPublicOutput(dir,result).length,0);
  fs.writeFileSync(path.join(dir,"out/search.json"),JSON.stringify({url:draft.route}));
  assert.ok(scanPublicOutput(dir,result).some(x=>x.token===draft.route));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test("B3-AC16 deny a forged, correctly shaped Studio source digest",()=>{
 const independentlyPinned={source_commit_sha:"a".repeat(40),digest_sha256:"b".repeat(64)};
 const approved={publisher:"reltroner-studio",published:true,rights:"public-redistribution-allowed",...independentlyPinned};
 assert.equal(validateStudioAttestation(approved,independentlyPinned),true);
 assert.equal(validateStudioAttestation(approved),false,"Missing independent trusted source must deny");
 assert.equal(validateStudioAttestation({...approved,published:false},independentlyPinned),false);
 assert.equal(validateStudioAttestation({...approved,rights:"private"},independentlyPinned),false);
 assert.equal(validateStudioAttestation({...approved,source_commit_sha:"c".repeat(40)},independentlyPinned),false);
 assert.equal(validateStudioAttestation({...approved,digest_sha256:"d".repeat(64)},independentlyPinned),false);
 assert.equal(validateStudioAttestation({...approved,source_commit_sha:"unverified"},independentlyPinned),false);
});
test("B3-AC15 public artifacts block CSS SVG sourcemap filename and unknown extensions",()=>{
 const result=compileManifest(root);
 const draft=result.allLessons.find(x=>x.status!=="published");
 assert.ok(draft);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),"reltroner-public-negative-"));
 try{
  const out=path.join(dir,"out");fs.mkdirSync(out);
  for(const ext of [".css",".svg",".map"]){
    fs.writeFileSync(path.join(out,"private"+ext),"/* "+draft.route+" */");
    assert.ok(scanPublicOutput(dir,result).some(x=>x.artifact==="private"+ext && x.token===draft.route));
  }
  fs.mkdirSync(path.join(out,"brand"),{recursive:true});
  fs.writeFileSync(path.join(out,"brand",".gitkeep"),"\n");
  assert.ok(!scanPublicOutput(dir,result).some(x=>x.artifact==="brand/.gitkeep"),"Whitespace-only approved placeholder allowed");
  fs.writeFileSync(path.join(out,"brand",".gitkeep"),"not a placeholder");
  assert.ok(scanPublicOutput(dir,result).some(x=>x.artifact==="brand/.gitkeep"&&x.token==="UNREVIEWED_PUBLIC_ASSET_TYPE"));
  fs.rmSync(path.join(out,"brand",".gitkeep"));
  fs.writeFileSync(path.join(out,"unreviewed.secret"),"benign");
  assert.ok(scanPublicOutput(dir,result).some(x=>x.token==="UNREVIEWED_PUBLIC_ASSET_TYPE"));
  fs.mkdirSync(path.join(out,"courses","in-world-living-lab"),{recursive:true});
  fs.writeFileSync(path.join(out,"courses","in-world-living-lab","index.html"),"blank");
  assert.ok(scanPublicOutput(dir,result).some(x=>x.channel==="filename"));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test("B3-AC15 public browser resource bundle imports only published course resource registries",()=>{
 const source=fs.readFileSync(path.join(root,"src/catalog/resources/public.ts"),"utf8");
 const targets=[...source.matchAll(/from "\.\.\/courses\/([a-z0-9-]+)\/resources"/g)].map(m=>m[1]);
 assert.ok(targets.length>0,"Public resources must explicitly declare approved imports");
 for(const slug of targets){
   const sourceCourse=fs.readFileSync(path.join(root,"src/catalog/courses",slug,"course.ts"),"utf8");
   assert.match(sourceCourse,/status:\s*"published"/,"Private course resources must never join public registry");
 }
 assert.ok(!source.includes("in-world-living-lab"));
 assert.ok(!source.includes("worldbuilding-operating-system"));
 const registry=fs.readFileSync(path.join(root,"src/lib/resource/resource-registry.ts"),"utf8");
 assert.ok(registry.includes("@/catalog/resources/public"));
});

test("B3-AC15 public course/path catalog import allowlists reject draft metadata",()=>{
 const sources=[
  ["src/catalog/courses/public.ts", "src/catalog/courses", "course.ts"],
  ["src/catalog/paths/public.ts", "src/catalog/paths", null]
 ];
 for(const [manifest,folder,courseFile] of sources){
  const src=fs.readFileSync(path.join(root,manifest),"utf8");
  assert.ok(!src.includes("worldbuilding-operating-system"));
  assert.ok(!src.includes("in-world-living-lab"));
  assert.ok(!src.includes("worldbuilding-creator"));
  if(courseFile){
   for(const [,slug] of src.matchAll(/from "\.\/([a-z0-9-]+)\/course"/g)){
    const published=fs.readFileSync(path.join(root,folder,slug,courseFile),"utf8");
    assert.match(published,/status:\s*"published"/);
   }
  }else{
   for(const [,slug] of src.matchAll(/from "\.\/([a-z0-9-]+)"/g)){
    const published=fs.readFileSync(path.join(root,folder,slug+".ts"),"utf8");
    assert.match(published,/status:\s*"published"/);
   }
  }
 }
 const deny=JSON.parse(fs.readFileSync(path.join(root,"contracts/catalog/unpublished-route-denylist.json"),"utf8")).denied;
 assert.equal(deny.length,3);
});

test("WIN-01 MDX input with CRLF is normalized to LF-only", () => {
  const crlfInput = "---\r\ntitle: \"HTTP Overview\"\r\ntags:\r\n  - \"fundamentals\"\r\n---\r\n# Introduction\r\n\r\nContent here.\r\n";
  const result = normalizeToLF(crlfInput);
  assert.equal(result.includes("\r"), false);
  assert.equal(result, "---\ntitle: \"HTTP Overview\"\ntags:\n  - \"fundamentals\"\n---\n# Introduction\n\nContent here.\n");
});

test("WIN-02 MDX input with LF preserves content unmodified", () => {
  const lfInput = "---\ntitle: \"HTTP Overview\"\ntags:\n  - \"fundamentals\"\n---\n# Introduction\n\nContent here.\n";
  const result = normalizeToLF(lfInput);
  assert.equal(result, lfInput);
});

test("WIN-03 Mixed CRLF, CR and LF input is deterministically normalized", () => {
  const mixedInput = "line1\r\nline2\rline3\nline4\r\n";
  const expected = "line1\nline2\nline3\nline4\n";
  assert.equal(normalizeToLF(mixedInput), expected);
});

test("WIN-04 Repeated normalization is idempotent with identical output", () => {
  const samples = [
    "line1\r\nline2\rline3\nline4\r\n",
    "pure\nlinux\nlf\n",
    "pure\r\nwindows\r\ncrlf\r\n",
    "legacy\rmac\ros9\r",
    "---\r\ntags:\r\n  - \"fundamentals\"\r\n---\r\n",
  ];
  for (const sample of samples) {
    const once = normalizeToLF(sample);
    const twice = normalizeToLF(once);
    assert.equal(twice, once);
  }
});

test("WIN-05 UTF-8 text is preserved without BOM insertion", () => {
  const utf8Input =
    "---\r\ntitle: \"HTTP \u6982\u8981 \u2014 Caf\u00e9 & \u{1F680}\"\r\nsummary: \"\u0422\u0435\u0441\u0442 unicode \u201csmart quotes\u201d and \u00e9/\u00e0\"\r\n---\r\n# \u30c6\u30b9\u30c8\r\n\r\n\u00a9 2026 Reltroner.\r\n";
  const expectedLF =
    "---\ntitle: \"HTTP \u6982\u8981 \u2014 Caf\u00e9 & \u{1F680}\"\nsummary: \"\u0422\u0435\u0441\u0442 unicode \u201csmart quotes\u201d and \u00e9/\u00e0\"\n---\n# \u30c6\u30b9\u30c8\n\n\u00a9 2026 Reltroner.\n";
  const result = normalizeToLF(utf8Input);
  assert.equal(result.startsWith("\uFEFF"), false);
  assert.notEqual(result.charCodeAt(0), 0xfeff);
  assert.equal(result, expectedLF);
});

test("WIN-06 Tracked source content under content/ is never modified", () => {
  const compiled = compileManifest(root);
  const beforeHashes = new Map();
  for (const l of compiled.allLessons) {
    const file = path.join(root, l.source_path);
    const buf = fs.readFileSync(file);
    const hash = crypto.createHash("sha256").update(buf).digest("hex");
    beforeHashes.set(l.source_path, { hash, length: buf.length, mtime: fs.statSync(file).mtimeMs });
  }

  const { count } = preparePublicContent(root);
  assert.equal(count, compiled.manifest.lesson_count);

  for (const l of compiled.allLessons) {
    const file = path.join(root, l.source_path);
    const buf = fs.readFileSync(file);
    const hash = crypto.createHash("sha256").update(buf).digest("hex");
    const before = beforeHashes.get(l.source_path);
    assert.equal(hash, before.hash, "Tracked source file " + l.source_path + " was modified!");
    assert.equal(buf.length, before.length);
    assert.equal(fs.statSync(file).mtimeMs, before.mtime);
  }
});

test("WIN-07 Draft or archived lessons are never added to public staging", () => {
  const compiled = compileManifest(root);
  const { count } = preparePublicContent(root);
  assert.equal(count, 3);

  const stagingDir = path.join(root, ".public-content");
  assert.ok(fs.existsSync(stagingDir));

  const stagedFiles = [];
  const walk = (d) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) walk(p);
      else stagedFiles.push(path.relative(stagingDir, p).replaceAll(path.sep, "/"));
    }
  };
  walk(stagingDir);

  assert.equal(stagedFiles.length, 3);
  const publishedRelPaths = compiled.allLessons
    .filter((x) => x.status === "published")
    .map((x) => path.relative("content", x.source_path).replaceAll(path.sep, "/"));
  assert.deepEqual(stagedFiles.sort(), publishedRelPaths.sort());

  for (const f of stagedFiles) {
    const content = fs.readFileSync(path.join(stagingDir, f), "utf8");
    assert.equal(content.includes("\r"), false, "Staged file " + f + " contains carriage return");
  }

  const unpublished = compiled.allLessons.filter((x) => x.status !== "published");
  assert.equal(unpublished.length, 28);
  for (const unpub of unpublished) {
    const unpubRel = path.relative("content", unpub.source_path).replaceAll(path.sep, "/");
    assert.equal(stagedFiles.includes(unpubRel), false, "Unpublished lesson " + unpubRel + " leaked into staging");
  }
});

test("WIN-08 Manifest generation remains stable and deterministic with frozen checksum", () => {
  const first = compileManifest(root);
  assert.equal(first.allLessons.length, 31);
  assert.equal(first.manifest.lesson_count, 3);
  assert.equal(first.hash, "1dfecfddc97ce1676a719b1538e2d12d17a40c77f51370951dcf69e634b86e43");

  const second = compileManifest(root);
  assert.equal(second.hash, "1dfecfddc97ce1676a719b1538e2d12d17a40c77f51370951dcf69e634b86e43");
  assert.equal(stableJSONString(first.manifest), stableJSONString(second.manifest));
});

test("WIN-09 Existing catalog and privacy negative tests continue passing with staging safeguards", () => {
  // Application safeguard: type enforcement in normalization
  assert.throws(() => normalizeToLF(null), /Expected string content for normalization/);
  assert.throws(() => normalizeToLF(123), /Expected string content for normalization/);
  assert.throws(() => normalizeToLF(Buffer.from("test")), /Expected string content for normalization/);

  // Application safeguard: staging destination boundary enforcement
  assert.throws(() => preparePublicContent(root + path.sep), /Refuse unsafe staging target/);

  // Fixture-based application safeguard checks
  const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "lms-win09-fixture-"));
  try {
    fs.cpSync(path.join(root, "content"), path.join(fixtureDir, "content"), { recursive: true });
    fs.cpSync(path.join(root, "contracts"), path.join(fixtureDir, "contracts"), { recursive: true });

    const targetMdx = path.join(fixtureDir, "content/courses/backend-engineering/lessons/01-http-overview.mdx");
    const originalMdx = fs.readFileSync(targetMdx, "utf8");

    // Application safeguard: dynamic status gating - demoting to draft strictly excludes it from staging
    fs.writeFileSync(targetMdx, originalMdx.replace("status: \"published\"", "status: \"draft\""), "utf8");
    const draftResult = preparePublicContent(fixtureDir);
    assert.equal(draftResult.count, 2);
    const stagedExcluded = path.join(fixtureDir, ".public-content/courses/backend-engineering/lessons/01-http-overview.mdx");
    assert.equal(fs.existsSync(stagedExcluded), false);

    // Application safeguard: unrecognized status fails closed
    fs.writeFileSync(targetMdx, originalMdx.replace("status: \"published\"", "status: \"unapproved\""), "utf8");
    assert.throws(() => preparePublicContent(fixtureDir), /Unrecognized status unapproved/);

    // Application safeguard: missing frontmatter fails closed
    fs.writeFileSync(targetMdx, "# No frontmatter here\n", "utf8");
    assert.throws(() => preparePublicContent(fixtureDir), /MDX missing frontmatter/);
  } finally {
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  }
});

test("WIN-10 Integration regression test with isolated CRLF fixture repository", () => {
  const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "lms-win10-fixture-"));
  try {
    fs.cpSync(path.join(root, "content"), path.join(fixtureDir, "content"), { recursive: true });
    fs.cpSync(path.join(root, "contracts"), path.join(fixtureDir, "contracts"), { recursive: true });

    const publishedLessons = [
      "content/courses/backend-engineering/lessons/01-http-overview.mdx",
      "content/courses/backend-engineering/lessons/02-http-methods.mdx",
      "content/courses/backend-engineering/lessons/03-rest-introduction.mdx",
    ];

    // Force published fixture MDX to CRLF regardless of host OS
    for (const rel of publishedLessons) {
      const fullPath = path.join(fixtureDir, rel);
      const content = fs.readFileSync(fullPath, "utf8");
      const crlfContent = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n/g, "\r\n");
      fs.writeFileSync(fullPath, crlfContent, "utf8");
      assert.ok(crlfContent.includes("\r\n"), "Fixture " + rel + " must contain CRLF");
    }

    // Capture before state of source fixture files
    const beforeSourceHashes = new Map();
    for (const rel of publishedLessons) {
      const fullPath = path.join(fixtureDir, rel);
      const buf = fs.readFileSync(fullPath);
      const hash = crypto.createHash("sha256").update(buf).digest("hex");
      beforeSourceHashes.set(rel, { hash, length: buf.length, buffer: buf });
    }

    // Check manifest before staging
    const manifestBefore = compileManifest(fixtureDir);
    assert.equal(manifestBefore.hash, "1dfecfddc97ce1676a719b1538e2d12d17a40c77f51370951dcf69e634b86e43");

    // Execute preparePublicContent against fixture
    const { count, total } = preparePublicContent(fixtureDir);
    assert.equal(count, 3);
    assert.equal(total, 31);

    // 1. Verify staged MDX is LF-only
    const stagingDir = path.join(fixtureDir, ".public-content");
    assert.ok(fs.existsSync(stagingDir));
    const stagedFiles = [];
    const walk = (d) => {
      for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, ent.name);
        if (ent.isDirectory()) walk(p);
        else stagedFiles.push(path.relative(stagingDir, p).replaceAll(path.sep, "/"));
      }
    };
    walk(stagingDir);

    assert.equal(stagedFiles.length, 3);
    for (const f of stagedFiles) {
      const buf = fs.readFileSync(path.join(stagingDir, f));
      assert.equal(buf.includes(0x0d), false, "Staged file " + f + " must not contain carriage return byte");
      const text = buf.toString("utf8");
      assert.equal(text.includes("\r"), false, "Staged file " + f + " must be LF-only");
    }

    // 2. Verify source fixture bytes remain unchanged
    for (const rel of publishedLessons) {
      const fullPath = path.join(fixtureDir, rel);
      const buf = fs.readFileSync(fullPath);
      const hash = crypto.createHash("sha256").update(buf).digest("hex");
      const before = beforeSourceHashes.get(rel);
      assert.equal(hash, before.hash, "Source fixture file " + rel + " hash changed");
      assert.equal(buf.length, before.length, "Source fixture file " + rel + " byte length changed");
      assert.deepEqual(buf, before.buffer, "Source fixture file " + rel + " bytes changed");
    }

    // 3. Verify only the three published lessons are staged
    const expectedRelPaths = [
      "courses/backend-engineering/lessons/01-http-overview.mdx",
      "courses/backend-engineering/lessons/02-http-methods.mdx",
      "courses/backend-engineering/lessons/03-rest-introduction.mdx",
    ];
    assert.deepEqual(stagedFiles.sort(), expectedRelPaths.sort());

    // 4. Verify manifest checksum is unchanged
    const manifestAfter = compileManifest(fixtureDir);
    assert.equal(manifestAfter.hash, "1dfecfddc97ce1676a719b1538e2d12d17a40c77f51370951dcf69e634b86e43");
    assert.equal(manifestAfter.hash, manifestBefore.hash);
  } finally {
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  }
});
