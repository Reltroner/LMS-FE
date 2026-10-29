import type { GenerationStatus, RetrievalStatus } from "../knowledge/types.ts";

// Conversation shapes and copy shared by the AI Guide page and the floating assistant. Kept
// apart from assistant-data.ts so the UI can render before the knowledge index loads.

export type MessageRole = "user" | "assistant";

export type MessageSource = {
  title: string;
  href: string;
  snippet?: string;
  lessonId?: string;
};

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  sources?: MessageSource[];
  state?: "loading" | "error" | "done";
  retrievalStatus?: RetrievalStatus;
  generationStatus?: GenerationStatus;
  retryQuestion?: string;
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
      "Ask about published lessons and courses — for example, Worldbuilding Operating System Lesson 01.01, “What Is Worldbuilding?”. Every reply links to the published passages it comes from.",
    state: "done",
  },
];

export const suggestedPrompts: string[] = [
  "What is worldbuilding?",
  "Explain Condition, Choice and Possible Effect using Lumenhaven.",
  "Why does the Lumenhaven teacher need permission?",
  "Are all 89 lessons currently available?",
  "Can worldbuilding guarantee professional problem-solving ability?",
];
