import { defineDocumentType, makeSource } from "contentlayer/source-files";

export const Lesson = defineDocumentType(() => ({
  name: "Lesson",
  filePathPattern: "courses/*/lessons/*.mdx",
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    summary: {
      type: "string",
      required: true,
    },
    kind: {
      type: "enum",
      options: ["lesson", "lab", "checkpoint", "capstone"],
      required: true,
    },
    status: {
      type: "enum",
      options: ["draft", "published", "archived"],
      required: true,
    },
    level: {
      type: "enum",
      options: ["beginner", "beginner-intermediate", "intermediate", "advanced"],
      required: true,
    },
    durationMinutes: {
      type: "number",
      required: true,
    },
    objectives: {
      type: "list",
      of: { type: "string" },
      required: true,
    },
    outputs: {
      type: "list",
      of: { type: "string" },
      required: true,
    },
    tags: {
      type: "list",
      of: { type: "string" },
      required: true,
    },
    resourceIds: {
      type: "list",
      of: { type: "string" },
      required: false,
    },
  },
  computedFields: {
    courseSlug: {
      type: "string",
      resolve: (lesson) => lesson._raw.flattenedPath.split("/")[1] ?? "",
    },
    slug: {
      type: "string",
      resolve: (lesson) => lesson._raw.sourceFileName.replace(/\.mdx$/, ""),
    },
    url: {
      type: "string",
      resolve: (lesson) => {
        const courseSlug = lesson._raw.flattenedPath.split("/")[1] ?? "";
        const lessonSlug = lesson._raw.sourceFileName.replace(/\.mdx$/, "");

        return `/courses/${courseSlug}/lessons/${lessonSlug}`;
      },
    },
  },
}));

export const ResourceNote = defineDocumentType(() => ({
  name: "ResourceNote",
  filePathPattern: "courses/*/resources/*.md",
  contentType: "markdown",
}));

export const AuthorNote = defineDocumentType(() => ({
  name: "AuthorNote",
  filePathPattern: "courses/*/author/*.md",
  contentType: "markdown",
}));

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Lesson, ResourceNote, AuthorNote],
  mdx: {
    mdxOptions: (options) => ({
      ...options,
      development: false,
    }),
  },
});
