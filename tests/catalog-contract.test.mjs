import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {compileManifest,stableJSONString,validateStudioAttestation,scanPublicOutput} from "../scripts/phase3b-catalog.mjs";

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
