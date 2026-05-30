import type { MetadataRoute } from "next";

import { getAllCourses } from "@/lib/content/course-registry";
import { getAllLessons } from "@/lib/content/lesson-registry";
import { getAllPaths } from "@/lib/content/path-registry";
import { createCanonicalUrl } from "@/lib/seo/metadata";

const lastModified = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const pathUrls = getAllPaths().map((path) => ({
    url: createCanonicalUrl(`/paths/${path.slug}`),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const courseUrls = getAllCourses().map((course) => ({
    url: createCanonicalUrl(`/courses/${course.slug}`),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const lessonUrls = getAllLessons().map((lesson) => ({
    url: createCanonicalUrl(`/courses/${lesson.course}/lessons/${lesson.slug}`),
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
