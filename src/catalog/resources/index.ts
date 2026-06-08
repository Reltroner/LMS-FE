import { backendEngineeringResources } from "../courses/backend-engineering/resources";
import { inWorldLivingLabResources } from "../courses/in-world-living-lab/resources";
import { worldbuildingOperatingSystemResources } from "../courses/worldbuilding-operating-system/resources";

export const resources = [
  ...backendEngineeringResources,
  ...worldbuildingOperatingSystemResources,
  ...inWorldLivingLabResources,
] as const;
