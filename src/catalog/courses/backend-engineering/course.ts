import type { CourseDefinition } from '../../../lib/content/validators.ts';

export const course = {
  "id": "course-backend-engineering",
  "slug": "backend-engineering",
  "aliases": [
    "backend-engineering-fundamentals"
  ],
  "title": "Backend Engineering Fundamentals",
  "subtitle": "Learn backend engineering fundamentals including HTTP, REST APIs, authentication, databases and deployment concepts.",
  "summary": "A course-as-code backend foundation covering HTTP, REST APIs, and the concepts behind production backend systems.",
  "category": "backend-engineering",
  "level": "beginner",
  "status": "archived",
  "estimatedHours": 20,
  "finalDeliverable": "Backend Engineering Foundations Notes",
  "authorSlug": "reltroner",
  "objectives": [
    "Explain the HTTP request and response model.",
    "Use standard HTTP methods with correct semantics.",
    "Design resource-oriented REST API contracts.",
    "Recognize the concepts behind production backend systems."
  ],
  "modules": [
    {
      "id": "module-http-fundamentals",
      "slug": "http-fundamentals",
      "title": "HTTP Fundamentals",
      "summary": "Understand the request and response model that powers the web.",
      "lessonSlugs": [
        "01-http-overview",
        "02-http-methods"
      ]
    },
    {
      "id": "module-rest-apis",
      "slug": "rest-apis",
      "title": "REST APIs",
      "summary": "Design resource-oriented API contracts with predictable behavior.",
      "lessonSlugs": [
        "03-rest-introduction"
      ]
    }
  ]
} satisfies CourseDefinition;
