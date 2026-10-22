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
      "Hello! I am your Reltroner Learning Assistant. I can help guide your curriculum sequence, explain core concepts (like systems thinking & worldbuilding), and locate course resources. Note that this is a simulated prototype companion.",
    state: "done",
  },
];

export const suggestedPrompts: string[] = [
  "Help me choose a learning path",
  "Explain creative constraints and causal relationships",
  "What should I learn next?",
  "Find worldbuilding resources",
  "Explain the mentorship process",
  "Summarize canon and continuity management",
];

const mockKnowledgeBase: {
  keywords: string[];
  content: string;
  sources: MessageSource[];
}[] = [
  {
    keywords: ["path", "choose", "recommend", "where to start"],
    content:
      "For systemic creative development, explore foundational world premise, civilization and culture logic, active power dynamics, and continuity management.",
    sources: [
      {
        title: "Learning Paths",
        href: "/paths",
      },
      {
        title: "Course Catalog",
        href: "/courses",
      },
    ],
  },
  {
    keywords: ["constraint", "creative constraint", "causal", "cause", "logic", "rules"],
    content:
      "Creative constraints are productive boundaries that force specific choices, prevent creative paralysis, and establish rules that govern how causes produce consequences across your fictional world.",
    sources: [
      {
        title: "Course Catalog",
        href: "/courses",
      },
    ],
  },
  {
    keywords: ["what should i learn", "next", "continue", "resume"],
    content:
      "Based on your simulated learner profile, there are currently no active course sessions. Explore the learning paths or browse available coursework to begin.",
    sources: [
      {
        title: "Learner Dashboard",
        href: "/dashboard",
      },
    ],
  },
  {
    keywords: ["resource", "docs", "documentation", "material", "template"],
    content:
      "Core curriculum references include structured design templates, causal rule sheets, and continuity guides provided with enrolled coursework.",
    sources: [
      {
        title: "Course Catalog",
        href: "/courses",
      },
    ],
  },
  {
    keywords: ["mentor", "mentorship", "booking", "session", "1-on-1"],
    content:
      "Reltroner mentorship pairs creators with experienced mentors for 1-on-1 world architecture reviews, creative constraint sprints, and canon guidance. You can browse offerings in the Mentorship hub.",
    sources: [
      {
        title: "Mentorship Directory",
        href: "/mentorship",
      },
    ],
  },
  {
    keywords: ["canon", "continuity", "bible", "management"],
    content:
      "Canon and continuity management establish single sources of truth for your fictional world, tracking decisions, world rules, and timeline anchors to prevent contradictions as the project expands.",
    sources: [
      {
        title: "Course Catalog",
        href: "/courses",
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
      "Here is a conceptual response based on Reltroner LMS curriculum material. For verified answers, please review the relevant course text directly. As a simulated prototype assistant, I cannot modify real database records or learner enrollments.",
    sources: [
      {
        title: "Course Catalog",
        href: "/courses",
      },
      {
        title: "Learning Paths",
        href: "/paths",
      },
    ],
    state: "done",
  };
}
