import fs from "node:fs";
import path from "node:path";
import {compileManifest} from "./phase3b-catalog.mjs";

const root=process.cwd();
const staging=path.join(root,".public-content");
const sourceContent=path.join(root,"content");
if(path.dirname(staging)!==root||path.basename(staging)!==".public-content")throw new Error("Refuse unsafe staging target");
const compiled=compileManifest(root);
const allowed=new Set(compiled.manifest.lessons.map(x=>x.lesson_id));
const published=compiled.allLessons.filter(x=>x.status==="published");
if(published.length!==allowed.size)throw new Error("Published manifest identity mismatch");
fs.rmSync(staging,{recursive:true,force:true});
let count=0;
for(const l of published){
 if(!allowed.has(l.lesson_id))throw new Error("Unlisted public lesson");
 const src=path.join(root,l.source_path);
 const meta=fs.lstatSync(src);
 if(!meta.isFile()||meta.isSymbolicLink())throw new Error("Only regular source files allowed");
 const rel=path.relative(sourceContent,src);
 if(rel.startsWith("..")||path.isAbsolute(rel))throw new Error("Path escapes content");
 const out=path.join(staging,rel);
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.copyFileSync(src,out,fs.constants.COPYFILE_EXCL);
 count++;
}
if(count!==compiled.manifest.lesson_count)throw new Error("Public staging count mismatch");
console.log("Public Contentlayer staged lessons:",count,"of",compiled.allLessons.length,"source MDX; draft/archived excluded");
