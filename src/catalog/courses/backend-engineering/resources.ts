import type { Resource } from '../../../types/course.ts';
export const resources = [
  {
    "id": "be-mdn-http-overview",
    "courseSlug": "backend-engineering",
    "type": "external-link",
    "title": "MDN HTTP Overview",
    "summary": "Reference documentation for core HTTP concepts.",
    "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview"
  },
  {
    "id": "be-mdn-http-methods",
    "courseSlug": "backend-engineering",
    "type": "external-link",
    "title": "MDN HTTP Request Methods",
    "summary": "Reference documentation for standard HTTP methods.",
    "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods"
  },
  {
    "id": "be-rfc-9110",
    "courseSlug": "backend-engineering",
    "type": "external-link",
    "title": "RFC 9110 — HTTP Semantics",
    "summary": "Authoritative semantics for HTTP/1.1 and HTTP/2.",
    "url": "https://www.rfc-editor.org/rfc/rfc9110.html"
  }
] satisfies readonly Resource[];
