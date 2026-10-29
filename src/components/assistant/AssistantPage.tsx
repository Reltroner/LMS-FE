"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SendIcon, SparklesIcon } from "@/components/ui/icons";
import { suggestedPrompts } from "@/lib/assistant/conversation";
import { GroundedAnswer } from "./GroundedAnswer";
import { useKnowledgeConversation } from "./useKnowledgeConversation";

// Set at build time when an authorized knowledge service exists; otherwise answers are
// source excerpts from the published index, computed in the browser.
const serviceConfigured = Boolean(process.env.NEXT_PUBLIC_KNOWLEDGE_SERVICE_URL);

// Arriving from the search palette's "Continue in AI Guide" (/ai/?q=…) asks that question once.
// Kept inside Suspense so the rest of the page is prerendered.
export function AssistantPageFromUrl() {
  return <AssistantPage initialQuestion={useSearchParams().get("q") ?? undefined} />;
}

// The AI Guide conversation. Shares useKnowledgeConversation (and so askKnowledgeAssistant)
// with the floating assistant.
export function AssistantPage({ initialQuestion }: { initialQuestion?: string }) {
  const { messages, isLoading, send, reset } = useKnowledgeConversation(initialQuestion);
  const [input, setInput] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages]);

  function submit(text: string) {
    send(text);
    setInput("");
  }

  const last = messages[messages.length - 1];
  return (
    <div id="guide-chat" className="flex min-w-0 flex-col rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
          <SparklesIcon width={18} height={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-foreground">Reltroner Learning Guide</h2>
          <p className="text-xs text-muted-foreground">
            {serviceConfigured
              ? "Connected to the knowledge service. Each reply says whether AI wrote it."
              : "Source-excerpt mode: no AI model is connected to this site."}
          </p>
        </div>
        <button type="button" onClick={reset} disabled={isLoading || messages.length <= 1}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50">
          New conversation
        </button>
      </div>

      <div ref={logRef} role="log" aria-label="Conversation" className="flex h-[26rem] flex-col gap-4 overflow-y-auto p-5">
        {messages.map((message) => (
          <GroundedAnswer key={message.id} message={message} onRetry={submit} retryDisabled={isLoading} />
        ))}
      </div>
      <p role="status" className="sr-only">
        {isLoading ? "Searching published lessons…" : last?.role === "assistant" && last.id !== "m-welcome" ? "Reply ready." : ""}
      </p>

      <form className="border-t border-border p-4" onSubmit={(event) => { event.preventDefault(); submit(input); inputRef.current?.focus(); }}>
        <div className="flex gap-2">
          <input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} maxLength={1000}
            placeholder="Ask about published lessons…" aria-label="Ask the assistant"
            className="h-12 min-w-0 flex-1 rounded-full border border-border bg-background px-5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30" />
          <button type="submit" disabled={!input.trim() || isLoading} aria-label="Send question"
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50">
            <SendIcon width={18} height={18} />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Suggested questions" role="group">
          {suggestedPrompts.map((prompt) => (
            <button key={prompt} type="button" disabled={isLoading} onClick={() => submit(prompt)}
              className="min-h-8 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-primary disabled:opacity-50">
              {prompt}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
