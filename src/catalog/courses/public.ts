import { backendEngineeringCourse } from "./backend-engineering/course";
import type { Course } from "../../types/course";

/** Explicit publication allowlist: never import draft course catalog modules into browser bundle. */
export const publicCourses = [backendEngineeringCourse] as readonly Course[];
