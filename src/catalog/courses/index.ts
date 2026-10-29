// Build-time authoring registry. Never import from app/components.
// Retired courses leave this list; their lesson identities stay in contracts/catalog/lesson-id-lifecycle.json.
import { course as worldbuilding } from "./worldbuilding-operating-system/course.ts";
import { course as livingLab } from "./in-world-living-lab/course.ts";
import { resources as worldbuildingResources } from "./worldbuilding-operating-system/resources.ts";
import { resources as livingLabResources } from "./in-world-living-lab/resources.ts";

export const authoringCatalog = [
  { course: worldbuilding, resources: worldbuildingResources },
  { course: livingLab, resources: livingLabResources },
];
