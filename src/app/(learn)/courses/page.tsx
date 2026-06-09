import { createMetadata } from "@/lib/seo/metadata";
import { CoursesPageClient } from "@/components/course/CoursesPageClient";
import { getAllCourses } from "@/lib/content/course-registry";
export const metadata = createMetadata({
  title: "Courses",
  description: "Browse engineering, AI, and project-based learning courses.",
  path: "/courses",
});

export default function CoursesPage() {
  const courses = getAllCourses();
  const totalModules = courses.reduce((total, course) => total + course.modules.length, 0);
  const totalLessons = courses.reduce(
    (total, course) =>
      total +
      course.modules.reduce(
        (courseTotal, courseModule) => courseTotal + courseModule.lessonSlugs.length,
        0,
      ),
    0,
  );

  return (
    <CoursesPageClient courses={courses} totalModules={totalModules} totalLessons={totalLessons} />
  );
}
