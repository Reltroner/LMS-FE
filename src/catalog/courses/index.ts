// Build-time authoring registry. Never import from app/components.
import { course as backend } from "./backend-engineering/course.ts";
import { course as worldbuilding } from "./worldbuilding-operating-system/course.ts";
import { course as livingLab } from "./in-world-living-lab/course.ts";
import { resources as backendResources } from "./backend-engineering/resources.ts";
import { resources as worldbuildingResources } from "./worldbuilding-operating-system/resources.ts";
import { resources as livingLabResources } from "./in-world-living-lab/resources.ts";

export const authoringCatalog = [
  { course: backend, resources: backendResources },
  { course: worldbuilding, resources: worldbuildingResources },
  { course: livingLab, resources: livingLabResources },
];
