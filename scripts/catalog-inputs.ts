import fs from "node:fs";
import path from "node:path";
import { authoringCatalog } from "../src/catalog/courses/index.ts";
import { publicCourseSlugs } from "../src/catalog/courses/public.ts";
import { paths } from "../src/catalog/paths/index.ts";
import { publicPathSlugs } from "../src/catalog/paths/public.ts";
import type { CatalogInputs } from "../src/lib/content/compiler.ts";

export function catalogInputs(root: string): CatalogInputs {
  const read = (name: string): unknown => JSON.parse(fs.readFileSync(path.join(root, "contracts/catalog", name), "utf8"));
  return {
    catalog: authoringCatalog, paths, publicCourseSlugs, publicPathSlugs,
    legacyRegistry: read("lesson-id-registry.json"),
    additionsRegistry: read("lesson-id-additions.json"),
    lifecycle: read("lesson-id-lifecycle.json"),
    denylist: read("unpublished-route-denylist.json"),
  };
}
