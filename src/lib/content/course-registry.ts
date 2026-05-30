import { backendEngineeringFundamentalsCourse } from "@/content/courses/backend-engineering/course";
import type { Course } from "@/types/course";

const courses = [backendEngineeringFundamentalsCourse] as const satisfies readonly Course[];

export function getAllCourses(): readonly Course[] {
  return courses;
}

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug);
}
