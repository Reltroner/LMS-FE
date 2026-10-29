"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRightIcon, SendIcon, SparklesIcon, XIcon } from "@/components/ui/icons";
import { suggestedPrompts } from "@/lib/assistant/conversation";
import { cn } from "@/lib/utils/cn";
import { PALETTE_OPEN_EVENT } from "@/components/search/SearchPaletteProvider";
import { GroundedAnswer } from "./GroundedAnswer";
import { useKnowledgeConversation } from "./useKnowledgeConversation";

// Compact, non-modal companion to the AI Guide: same useKnowledgeConversation engine, same
// citations. Hidden on the AI Guide itself and closed whenever the search palette opens.
export function FloatingChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isLoading, send } = useKnowledgeConversation();
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };
    const close = () => setIsOpen(false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(PALETTE_OPEN_EVENT, close);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(PALETTE_OPEN_EVENT, close);
    };
  }, [isOpen]);

  if (/^\/(ai|assistant)\/?$/.test(pathname ?? "")) return null;

  function submit(text: string) {
    send(text);
    setInput("");
  }

  return (
    <aside aria-label="Learning guide">
      <button ref={triggerRef} type="button" onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close learning guide" : "Open learning guide"} aria-expanded={isOpen} aria-controls="floating-guide-panel"
        className={cn("fixed bottom-5 right-5 z-40 flex h-13 w-13 items-center justify-center rounded-full shadow-lg transition sm:bottom-6 sm:right-6",
          isOpen ? "border border-border bg-card text-foreground" : "bg-gradient-to-br from-primary to-accent text-white hover:scale-105")}>
        {isOpen ? <XIcon width={22} height={22} /> : <SparklesIcon width={22} height={22} />}
      </button>

      {isOpen && (
        <div id="floating-guide-panel" role="dialog" aria-modal="false" aria-label="Reltroner Learning Guide"
          className="fixed bottom-21 right-4 z-40 flex h-[min(32rem,calc(100dvh-7rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:right-6 sm:w-96">
          <div className="flex items-center justify-between border-b border-border bg-background-elevated px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Reltroner Learning Guide</p>
              <p className="text-[11px] text-muted-foreground">Answers link to published lessons</p>
            </div>
            <Link href="/ai/" onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5">
              Open AI Guide <ArrowUpRightIcon width={13} height={13} />
            </Link>
          </div>

          <div role="log" aria-label="Conversation" className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.map((message) => (
              <GroundedAnswer key={message.id} message={message} compact onRetry={submit} retryDisabled={isLoading}
                onNavigate={() => setIsOpen(false)} />
            ))}
            <div ref={endRef} />
          </div>
          <p role="status" className="sr-only">{isLoading ? "Searching published lessons…" : ""}</p>

          <div className="border-t border-border px-3 py-2">
            <div className="flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Suggested questions">
              {suggestedPrompts.slice(0, 3).map((prompt) => (
                <button key={prompt} type="button" disabled={isLoading} onClick={() => submit(prompt)}
                  className="min-h-7 shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-foreground disabled:opacity-50">
                  {prompt}
                </button>
              ))}
            </div>
          </div>
          <form className="border-t border-border p-3" onSubmit={(event) => { event.preventDefault(); submit(input); }}>
            <div className="flex items-center gap-2">
              <input ref={inputRef} type="text" value={input} onChange={(event) => setInput(event.target.value)} maxLength={1000}
                placeholder="Ask about published lessons…" aria-label="Ask the learning guide"
                className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              <button type="submit" disabled={!input.trim() || isLoading} aria-label="Send question"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50">
                <SendIcon width={15} height={15} />
              </button>
            </div>
          </form>
        </div>
      )}
    </aside>
  );
}
