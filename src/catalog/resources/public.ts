import { backendEngineeringResources } from "../courses/backend-engineering/resources";
import type { Resource } from "../../types/resource";

/**
 * FZ-11/3B-04 explicit public-resource allowlist.
 * Backend Engineering is the ONLY currently published course.
 * Do not import draft worldbuilding/in-world author resource registries into browser bundles.
 * Add new course resource imports only after its full publication/right attestation approval.
 */
export const publicResources = [...backendEngineeringResources] as readonly Resource[];
