import type { MetadataRoute } from "next";

import { getAllCourses } from "@/lib/content/course-registry";
import { getAllLessons } from "@/lib/content/lesson-registry";
import { getAllPaths } from "@/lib/content/path-registry";
import { courseUrl, lessonUrl, pathUrl } from "@/lib/routes/route-builders";
import { createCanonicalUrl } from "@/lib/seo/metadata";

export const dynamic = "force-static";

const lastModified = new Date("2026-06-08T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const pathUrls = getAllPaths().map((path) => ({
    url: createCanonicalUrl(pathUrl(path.slug)),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const courseUrls = getAllCourses().map((course) => ({
    url: createCanonicalUrl(courseUrl(course.slug)),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const lessonUrls = getAllLessons().map((lesson) => ({
    url: createCanonicalUrl(lessonUrl(lesson.courseSlug, lesson.slug)),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: createCanonicalUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: createCanonicalUrl("/courses"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: createCanonicalUrl("/paths"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...pathUrls,
    ...courseUrls,
    ...lessonUrls,
    {
      url: createCanonicalUrl("/search"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];
}
