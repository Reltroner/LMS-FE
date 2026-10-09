import { fullStackBackendEngineerPath } from "./full-stack-backend-engineer";
import type { LearningPath } from "../../types/path";

/** Explicit publication allowlist: never include unpublished path metadata in public bundle. */
export const publicLearningPaths = [fullStackBackendEngineerPath] as readonly LearningPath[];
