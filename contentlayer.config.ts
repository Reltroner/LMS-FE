import { defineDocumentType, makeSource } from "contentlayer/source-files";

export const Lesson = defineDocumentType(() => ({
  name: "Lesson",
  filePathPattern: "courses/**/*.mdx",
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
      required: true,
    },
    duration: {
      type: "string",
      required: true,
    },
    order: {
      type: "number",
      required: true,
    },
    module: {
      type: "string",
      required: true,
    },
    course: {
      type: "string",
      required: true,
    },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (lesson) => lesson._raw.sourceFileName.replace(/\.mdx$/, ""),
    },
  },
}));

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Lesson],
  mdx: {
    mdxOptions: (options) => ({
      ...options,
      development: false,
    }),
  },
});
