import type { Metadata } from "next";

import type { LessonDocument } from "@/lib/content/lesson-registry";
import { site } from "@/lib/seo/site";
import type { Course } from "@/types/course";

type OpenGraphType = "website" | "article";

type CreateMetadataOptions = {
  title?: string;
  description: string;
  path: string;
  openGraphType?: OpenGraphType;
};

type CreateLessonMetadataOptions = {
  course: Course;
  lesson: LessonDocument;
};

const siteUrl = `https://${site.domain}`;

export function getSiteUrl() {
  return siteUrl;
}

export function createCanonicalUrl(path: string) {
  return new URL(path, `${siteUrl}/`).toString();
}

export function createMetadata({
  title,
  description,
  path,
  openGraphType = "website",
}: CreateMetadataOptions): Metadata {
  const canonicalUrl = createCanonicalUrl(path);
  const resolvedTitle = title ?? site.title;

  return {
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: resolvedTitle,
      description,
      url: canonicalUrl,
      siteName: site.name,
      type: openGraphType,
    },
    twitter: {
      card: "summary",
      title: resolvedTitle,
      description,
    },
  };
}

export function createCourseMetadata(course: Course): Metadata {
  return createMetadata({
    title: course.title,
    description: course.description,
    path: `/courses/${course.slug}`,
  });
}

export function createLessonMetadata({ course, lesson }: CreateLessonMetadataOptions): Metadata {
  return createMetadata({
    title: `${lesson.title} | ${course.title}`,
    description: lesson.description,
    path: `/courses/${course.slug}/lessons/${lesson.slug}`,
    openGraphType: "article",
  });
}
