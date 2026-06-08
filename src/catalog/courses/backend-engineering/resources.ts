import type { Resource } from "../../../types/resource";

export const backendEngineeringResources = [
  {
    id: "be-mdn-http-overview",
    courseSlug: "backend-engineering",
    type: "external-link",
    title: "MDN HTTP Overview",
    summary: "Reference documentation for core HTTP concepts.",
    url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview",
  },
  {
    id: "be-mdn-http-methods",
    courseSlug: "backend-engineering",
    type: "external-link",
    title: "MDN HTTP Request Methods",
    summary: "Reference documentation for standard HTTP methods.",
    url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods",
  },
] as const satisfies readonly Resource[];
