import type { LessonDocument } from "@/lib/content/lesson-registry";
import { createCanonicalUrl } from "@/lib/seo/metadata";
import { site } from "@/lib/seo/site";
import type { Course } from "@/types/course";

type StructuredDataValue = Readonly<Record<string, unknown>>;

type CreateLessonStructuredDataOptions = {
  course: Course;
  lesson: LessonDocument;
};

type CreateWebPageStructuredDataOptions = {
  name: string;
  description: string;
  path: string;
};

function createOrganizationReference() {
  return {
    "@type": "Organization",
    name: site.name,
    url: createCanonicalUrl("/"),
  } satisfies StructuredDataValue;
}

function createWebsiteReference() {
  return {
    "@type": "WebSite",
    name: site.name,
    url: createCanonicalUrl("/"),
  } satisfies StructuredDataValue;
}

export function createOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: createCanonicalUrl("/"),
    description: site.description,
  } satisfies StructuredDataValue;
}

export function createCollectionPageStructuredData(courses: readonly Course[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Courses",
    description: "Browse engineering, AI, and project-based learning courses.",
    url: createCanonicalUrl("/courses"),
    isPartOf: createWebsiteReference(),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: courses.map((course, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: course.title,
        url: createCanonicalUrl(`/courses/${course.slug}`),
      })),
    },
  } satisfies StructuredDataValue;
}

export function createCourseStructuredData(course: Course) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    url: createCanonicalUrl(`/courses/${course.slug}`),
    provider: createOrganizationReference(),
    educationalLevel: course.level,
    timeRequired: `PT${course.estimatedHours}H`,
  } satisfies StructuredDataValue;
}

export function createLessonStructuredData({ course, lesson }: CreateLessonStructuredDataOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: lesson.title,
    description: lesson.description,
    url: createCanonicalUrl(`/courses/${course.slug}/lessons/${lesson.slug}`),
    articleSection: lesson.module,
    author: createOrganizationReference(),
    publisher: createOrganizationReference(),
    isPartOf: {
      "@type": "Course",
      name: course.title,
      url: createCanonicalUrl(`/courses/${course.slug}`),
    },
  } satisfies StructuredDataValue;
}

export function createWebPageStructuredData({
  name,
  description,
  path,
}: CreateWebPageStructuredDataOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: createCanonicalUrl(path),
    isPartOf: createWebsiteReference(),
  } satisfies StructuredDataValue;
}
