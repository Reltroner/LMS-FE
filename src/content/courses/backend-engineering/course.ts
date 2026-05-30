import type { Course } from "@/types/course";

export const backendEngineeringFundamentalsCourse = {
  id: "course-backend-engineering-fundamentals",
  slug: "backend-engineering-fundamentals",
  title: "Backend Engineering Fundamentals",
  description:
    "Learn backend engineering fundamentals including HTTP, REST APIs, authentication, databases and deployment concepts.",
  level: "Beginner",
  estimatedHours: 20,
  modules: [
    {
      id: "module-http-fundamentals",
      slug: "http-fundamentals",
      title: "HTTP Fundamentals",
      description: "Understand the request and response model that powers the web.",
      order: 1,
      lessons: [
        {
          id: "lesson-http-overview",
          slug: "01-http-overview",
          title: "HTTP Overview",
          description: "Introduction to HTTP fundamentals",
          duration: 15,
          order: 1,
        },
        {
          id: "lesson-http-methods",
          slug: "02-http-methods",
          title: "HTTP Methods",
          description: "Learn how HTTP methods describe client intent",
          duration: 20,
          order: 2,
        },
      ],
    },
    {
      id: "module-rest-apis",
      slug: "rest-apis",
      title: "REST APIs",
      description: "Design resource-oriented API contracts with predictable behavior.",
      order: 2,
      lessons: [
        {
          id: "lesson-rest-introduction",
          slug: "03-rest-introduction",
          title: "REST Introduction",
          description: "Introduction to resource-oriented API design",
          duration: 25,
          order: 1,
        },
      ],
    },
    {
      id: "module-authentication",
      slug: "authentication",
      title: "Authentication",
      description: "Learn the core concepts behind identity, sessions, tokens, and access.",
      order: 3,
      lessons: [],
    },
  ],
} as const satisfies Course;
