export type ContentBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "code"; language?: string; code: string }
  | { type: "callout"; tone: "info" | "tip" | "warning"; text: string }
  | { type: "checkpoint"; title: string; items: string[] };

