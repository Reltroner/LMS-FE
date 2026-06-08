import { backendEngineeringCourse } from "./backend-engineering/course";
import { inWorldLivingLabCourse } from "./in-world-living-lab/course";
import { worldbuildingOperatingSystemCourse } from "./worldbuilding-operating-system/course";

export const courses = [
  backendEngineeringCourse,
  worldbuildingOperatingSystemCourse,
  inWorldLivingLabCourse,
] as const;
