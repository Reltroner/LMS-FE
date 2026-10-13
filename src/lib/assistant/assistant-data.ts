/**
 * RELTRONER LMS — SHARED ASSISTANT ENGINE & FIXTURES
 * ----------------------------------------------------------------------------
 * Shared deterministic mock logic and prompt responses for both the
 * full /assistant page and the floating chat widget.
 *
 * PROTOTYPE TRUST BOUNDARIES:
 * - No external API requests, keys, or live LLMs.
 * - Presentation simulation only.
 * - Cannot mutate learner progress, enrollments, or bookings.
 * ----------------------------------------------------------------------------
 */

export type MessageRole = "user" | "assistant";

export type MessageSource = {
  title: string;
  href: string;
};

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  sources?: MessageSource[];
  state?: "loading" | "error" | "done";
};

let messageCounter = 0;
export function createMessageId(prefix: "user" | "assistant" | "u" | "a"): string {
  messageCounter += 1;
  return `${prefix}-${messageCounter}`;
}

export const seedMessages: Message[] = [
  {
    id: "m-welcome",
    role: "assistant",
    content:
      "Hello! I am your Reltroner Learning Assistant. I can help guide your curriculum sequence, explain core concepts (like HTTP & REST), and locate course resources. Note that this is a simulated prototype companion.",
    state: "done",
  },
];

export const suggestedPrompts: string[] = [
  "Help me choose a learning path",
  "Explain HTTP methods and idempotency",
  "What should I learn next?",
  "Find backend engineering resources",
  "Explain the mentorship process",
  "Summarize REST API design",
];

const mockKnowledgeBase: {
  keywords: string[];
  content: string;
  sources: MessageSource[];
}[] = [
  {
    keywords: ["path", "choose", "recommend", "where to start"],
    content:
      "If you're starting in backend engineering, we recommend the 'Full Stack Backend Engineer' learning path. It starts with the published 'Backend Engineering Fundamentals' course (HTTP & REST), followed by advanced API design patterns and deployment practices.",
    sources: [
      {
        title: "Full Stack Backend Engineer Path",
        href: "/paths/full-stack-backend-engineer",
      },
      {
        title: "Backend Engineering Fundamentals",
        href: "/courses/backend-engineering",
      },
    ],
  },
  {
    keywords: ["http", "method", "get", "post", "put", "delete", "idempotent"],
    content:
      "HTTP methods define desired actions on resources: GET retrieves data without side effects; POST creates resources; PUT replaces or updates a resource idempotently; and DELETE removes resources. Idempotency guarantees that multiple identical requests yield the same resource state.",
    sources: [
      {
        title: "Lesson: HTTP Methods & Semantics",
        href: "/courses/backend-engineering/lessons/02-http-methods",
      },
      {
        title: "MDN: HTTP request methods",
        href: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods",
      },
    ],
  },
  {
    keywords: ["what should i learn", "next", "continue", "resume"],
    content:
      "Based on your simulated learner profile, you last visited '03-rest-introduction' in Backend Engineering Fundamentals. Your next recommended step is completing the REST architecture checkpoint before moving on to contract-first design.",
    sources: [
      {
        title: "Lesson: Introduction to REST APIs",
        href: "/courses/backend-engineering/lessons/03-rest-introduction",
      },
      {
        title: "Learner Dashboard",
        href: "/dashboard",
      },
    ],
  },
  {
    keywords: ["resource", "docs", "documentation", "material"],
    content:
      "Key references for backend foundations include MDN's HTTP documentation, RFC 9110 (HTTP Semantics), and the official course notes provided in each lesson's resource sidebar.",
    sources: [
      {
        title: "RFC 9110 — HTTP Semantics",
        href: "https://www.rfc-editor.org/rfc/rfc9110",
      },
      {
        title: "Course Catalog Resources",
        href: "/courses/backend-engineering",
      },
    ],
  },
  {
    keywords: ["mentor", "mentorship", "booking", "session", "1-on-1"],
    content:
      "Reltroner mentorship pairs learners with experienced engineers for 1-on-1 code reviews, architectural feedback, and career guidance. You can browse mentor specialties and simulate a session reservation in the Mentorship hub.",
    sources: [
      {
        title: "Mentorship Directory",
        href: "/mentorship",
      },
      {
        title: "Book a Mentorship Session",
        href: "/mentorship/book",
      },
    ],
  },
  {
    keywords: ["rest", "api", "design", "contract"],
    content:
      "Resource-oriented REST APIs use nouns in URI paths (e.g., /users, /courses), standard HTTP status codes (200, 201, 400, 404), and consistent error structures. Contract-first design ensures APIs are defined and reviewed prior to backend implementation.",
    sources: [
      {
        title: "Lesson: Introduction to REST APIs",
        href: "/courses/backend-engineering/lessons/03-rest-introduction",
      },
      {
        title: "Course: API Design Patterns (Prototype Mock)",
        href: "/courses/api-design-patterns",
      },
    ],
  },
];

export function matchAssistantResponse(query: string): Omit<Message, "id" | "role"> {
  const normalized = query.trim().toLowerCase();

  for (const entry of mockKnowledgeBase) {
    if (entry.keywords.some((kw) => normalized.includes(kw))) {
      return {
        content: entry.content,
        sources: entry.sources,
        state: "done",
      };
    }
  }

  return {
    content:
      "Here is a conceptual response based on Reltroner LMS published course material. For verified answers, please review the relevant lesson text directly. As a simulated prototype assistant, I cannot modify real database records or learner enrollments.",
    sources: [
      {
        title: "Backend Engineering Fundamentals",
        href: "/courses/backend-engineering",
      },
      {
        title: "Learning Paths",
        href: "/paths",
      },
    ],
    state: "done",
  };
}
