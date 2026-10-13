/**
 * Structured lesson body content.
 * - Backend Engineering lessons use the REAL published MDX prose from LMS-FE.
 * - Content is represented as blocks (not raw MDX) so it can be rendered with
 *   accessible, theme-aware components without adding a markdown dependency.
 */

export type ContentBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "code"; language?: string; code: string }
  | { type: "callout"; tone: "info" | "tip" | "warning"; text: string }
  | { type: "checkpoint"; title: string; items: string[] };

export type LessonContent = {
  lessonSlug: string;
  blocks: ContentBlock[];
};

export const lessonContents: readonly LessonContent[] = [
  {
    lessonSlug: "01-http-overview",
    blocks: [
      {
        type: "paragraph",
        text: "HTTP stands for Hypertext Transfer Protocol. It is the communication model that lets a client ask a server for a resource and lets the server send a response back.",
      },
      {
        type: "paragraph",
        text: "In backend engineering, HTTP is the foundation for web applications, REST APIs, and many service-to-service integrations. When you understand HTTP clearly, API design becomes much easier to reason about.",
      },
      { type: "heading", level: 2, text: "Client and Server" },
      {
        type: "paragraph",
        text: "A client is the application making the request. This can be a browser, a mobile app, another backend service, or a command-line tool.",
      },
      {
        type: "paragraph",
        text: "A server receives the request, decides how to handle it, and returns a response. The server may read files, run business logic, query a database, or call another service before responding.",
      },
      { type: "heading", level: 2, text: "Request and Response" },
      {
        type: "paragraph",
        text: "An HTTP request describes what the client wants. It usually includes a method, a URL, headers, and sometimes a body.",
      },
      {
        type: "paragraph",
        text: "An HTTP response describes what happened. It includes a status code, headers, and often a body containing data or an error message.",
      },
      {
        type: "callout",
        tone: "tip",
        text: "The request and response cycle is the smallest useful unit of backend communication.",
      },
      {
        type: "code",
        language: "http",
        code: "GET /api/courses/backend-engineering HTTP/1.1\nHost: lms-api.reltroner.com\nAccept: application/json",
      },
      {
        type: "code",
        language: "http",
        code: "HTTP/1.1 200 OK\nContent-Type: application/json\n\n{ \"id\": \"course-backend-engineering\" }",
      },
      {
        type: "checkpoint",
        title: "Checkpoint",
        items: [
          "Write a one-sentence definition of HTTP.",
          "List the four main parts of an HTTP request.",
          "Explain what a status code communicates.",
        ],
      },
    ],
  },
  {
    lessonSlug: "02-http-methods",
    blocks: [
      {
        type: "paragraph",
        text: "HTTP methods (also called verbs) tell the server what kind of action the client wants to perform. Choosing the right method makes an API predictable.",
      },
      { type: "heading", level: 2, text: "Safe and Idempotent Methods" },
      {
        type: "paragraph",
        text: "A safe method does not change server state. An idempotent method can be called many times with the same result.",
      },
      {
        type: "list",
        items: [
          "GET — retrieve a resource. Safe and idempotent.",
          "HEAD — like GET but without a body. Safe and idempotent.",
          "PUT — replace a resource. Idempotent, not safe.",
          "DELETE — remove a resource. Idempotent, not safe.",
        ],
      },
      { type: "heading", level: 2, text: "Mutating Methods" },
      {
        type: "list",
        items: [
          "POST — create a resource or trigger an action. Neither safe nor idempotent.",
          "PATCH — apply a partial update. Not guaranteed idempotent.",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        text: "Never use GET for operations that change state. Caches and proxies may replay GET requests.",
      },
      {
        type: "checkpoint",
        title: "Checkpoint",
        items: [
          "Classify GET, POST, PUT, and DELETE by safety and idempotency.",
          "Explain why POST is not idempotent.",
        ],
      },
    ],
  },
  {
    lessonSlug: "03-rest-introduction",
    blocks: [
      {
        type: "paragraph",
        text: "REST is an architectural style for designing networked APIs around resources and standard HTTP behavior.",
      },
      { type: "heading", level: 2, text: "Resources" },
      {
        type: "paragraph",
        text: "Resources are the nouns in your API. Examples include users, courses, lessons, orders, and invoices.",
      },
      { type: "heading", level: 2, text: "Predictable APIs" },
      {
        type: "paragraph",
        text: "A REST API is easier to understand when URLs identify resources and HTTP methods describe actions.",
      },
      {
        type: "code",
        language: "http",
        code: "GET    /api/courses            # list courses\nGET    /api/courses/:slug      # one course\nPOST   /api/courses            # create course\nPUT    /api/courses/:slug      # replace course\nDELETE /api/courses/:slug      # remove course",
      },
      {
        type: "callout",
        tone: "info",
        text: "REST is a style, not a strict protocol. The goal is consistency and predictability.",
      },
      {
        type: "checkpoint",
        title: "Checkpoint",
        items: [
          "List three resources in a learning platform.",
          "Design the URL + method for listing lessons in a course.",
        ],
      },
    ],
  },
];

export function getLessonContent(slug: string): ContentBlock[] {
  return lessonContents.find((l) => l.lessonSlug === slug)?.blocks ?? [];
}
