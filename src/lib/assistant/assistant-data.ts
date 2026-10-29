import { publicKnowledgeIndex } from "../knowledge/public-index.ts";
import {
  executeKnowledgeAnswer,
  MAX_HISTORY_TURNS,
  MAX_QUESTION_CHARS,
} from "../knowledge/service.ts";
import type {
  ConversationTurn,
  KnowledgeAnswerResponse,
  KnowledgeModelAdapter,
} from "../knowledge/types.ts";
import type { Message, MessageSource } from "./conversation.ts";

export {
  createMessageId, seedMessages, suggestedPrompts,
  type Message, type MessageRole, type MessageSource,
} from "./conversation.ts";

export type AskAssistantOptions = Readonly<{
  serviceUrl?: string;
  modelAdapter?: KnowledgeModelAdapter | null;
  requireLiveProvider?: boolean;
  fetchImpl?: typeof fetch;
}>;

function toMessageFromResponse(response: KnowledgeAnswerResponse): Omit<Message, "id" | "role"> {
  const sources: MessageSource[] = response.citations.map((c) => ({
    title: c.title,
    href: c.sourceUrl,
    snippet: c.snippet,
    ...(c.lessonId ? { lessonId: c.lessonId } : {}),
  }));

  return {
    content: response.answer,
    sources,
    state: response.error === "MODEL_INVOCATION_FAILED" ? "error" : "done",
    retrievalStatus: response.retrievalStatus,
    generationStatus: response.generationStatus,
  };
}

/**
 * Shared RAG assistant client consumed by both `/assistant` and `FloatingChatWidget`.
 * Uses the configured Knowledge Service endpoint when available, or executes the
 * shared retrieval-grounded pipeline against the versioned public knowledge index.
 */
export async function askKnowledgeAssistant(
  question: string,
  priorMessages: readonly Message[] = [],
  options: AskAssistantOptions = {},
): Promise<Omit<Message, "id" | "role">> {
  const trimmed = question.trim();
  if (!trimmed) {
    return {
      content: "Please enter a question about published course content.",
      sources: [],
      state: "error",
      retrievalStatus: "no_evidence",
      generationStatus: "abstained",
    };
  }
  if (trimmed.length > MAX_QUESTION_CHARS) {
    return {
      content: `Your question exceeds the maximum length of ${MAX_QUESTION_CHARS} characters. Please shorten your question and try again.`,
      sources: [],
      state: "error",
      retrievalStatus: "no_evidence",
      generationStatus: "abstained",
      retryQuestion: trimmed.slice(0, MAX_QUESTION_CHARS),
    };
  }

  const history: ConversationTurn[] = priorMessages
    .filter((m) => m.id !== "m-welcome" && m.state === "done" && (m.role === "user" || m.role === "assistant"))
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({
      role: m.role,
      content: m.content,
    }));

  const configuredServiceUrl =
    options.serviceUrl ??
    (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_KNOWLEDGE_SERVICE_URL : undefined);

  if (configuredServiceUrl) {
    const fetchFn = options.fetchImpl ?? fetch;
    try {
      const endpoint = `${configuredServiceUrl.replace(/\/+$/, "")}/v1/knowledge/answer`;
      const res = await fetchFn(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, history }),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { message?: string };
        return {
          content: errData.message ?? `Knowledge Service returned HTTP ${res.status}.`,
          sources: [],
          state: "error",
          generationStatus: "unavailable",
          retryQuestion: trimmed,
        };
      }

      const data = (await res.json()) as KnowledgeAnswerResponse;
      return {
        ...toMessageFromResponse(data),
        retryQuestion: trimmed,
      };
    } catch {
      return {
        content:
          "Unable to reach the configured Knowledge Service endpoint. Check that the RAG service is running and try again.",
        sources: [],
        state: "error",
        generationStatus: "unavailable",
        retryQuestion: trimmed,
      };
    }
  }

  // Execute against the shared public knowledge index (retrieval-only when no modelAdapter is injected)
  try {
    const response = await executeKnowledgeAnswer(
      { question: trimmed, history },
      {
        index: publicKnowledgeIndex,
        modelAdapter: options.modelAdapter ?? null,
        requireLiveProvider: options.requireLiveProvider ?? false,
      },
    );
    return {
      ...toMessageFromResponse(response),
      retryQuestion: trimmed,
    };
  } catch {
    return {
      content: "Knowledge retrieval failed unexpectedly. Please try again.",
      sources: [],
      state: "error",
      generationStatus: "unavailable",
      retryQuestion: trimmed,
    };
  }
}
