"use client";

import { useEffect, useState } from "react";
import { createMessageId, seedMessages, type Message } from "@/lib/assistant/conversation";

const MAX_INITIAL_QUESTION_CHARS = 300;
const INITIAL_REPLY_ID = "a-initial";

type Reply = Omit<Message, "id" | "role">;

const userMessage = (content: string): Message => ({ id: createMessageId("u"), role: "user", content, state: "done" });
const pending = (id: string): Message => ({ id, role: "assistant", content: "Searching published lessons…", state: "loading" });
const failure = (question: string): Reply => ({
  content: "The assistant could not load. Check your connection and try again.",
  state: "error", generationStatus: "unavailable", retryQuestion: question,
});

// Loaded on first use so the knowledge index is not part of every page's JavaScript.
async function ask(question: string, prior: readonly Message[]): Promise<Reply> {
  const { askKnowledgeAssistant } = await import("@/lib/assistant/assistant-data");
  return askKnowledgeAssistant(question, prior);
}

// One conversation engine for the AI Guide page and the floating assistant: both call the shared
// askKnowledgeAssistant() service. initialQuestion (from /ai/?q=) is asked once on arrival.
export function useKnowledgeConversation(initialQuestion?: string) {
  const [initial] = useState(() => initialQuestion?.trim().slice(0, MAX_INITIAL_QUESTION_CHARS) || null);
  const [messages, setMessages] = useState<Message[]>(() =>
    initial ? [...seedMessages, userMessage(initial), pending(INITIAL_REPLY_ID)] : seedMessages);
  const [isLoading, setIsLoading] = useState(Boolean(initial));

  function settle(replyId: string, reply: Reply) {
    setMessages((current) => current.map((m) => (m.id === replyId ? { ...m, ...reply } : m)));
    setIsLoading(false);
  }

  useEffect(() => {
    if (!initial) return;
    let active = true;
    ask(initial, seedMessages).then(
      (reply) => { if (active) settle(INITIAL_REPLY_ID, reply); },
      () => { if (active) settle(INITIAL_REPLY_ID, failure(initial)); },
    );
    return () => { active = false; };
  }, [initial]);

  function send(text: string) {
    const question = text.trim();
    if (!question || isLoading) return;
    const prior = messages;
    const replyId = createMessageId("a");
    setMessages([...prior, userMessage(question), pending(replyId)]);
    setIsLoading(true);
    ask(question, prior).then((reply) => settle(replyId, reply), () => settle(replyId, failure(question)));
  }

  function reset() {
    if (!isLoading) setMessages(seedMessages);
  }

  return { messages, isLoading, send, reset };
}
