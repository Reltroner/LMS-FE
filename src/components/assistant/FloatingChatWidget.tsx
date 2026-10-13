"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ExternalLinkIcon,
  SendIcon,
  SparklesIcon,
  XIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import {
  type Message,
  seedMessages,
  suggestedPrompts,
  matchAssistantResponse,
  createMessageId,
} from "@/lib/assistant/assistant-data";

export function FloatingChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Don't render floating widget when user is already on the dedicated /assistant page
  if (pathname === "/assistant") {
    return null;
  }

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: createMessageId("u"),
      role: "user",
      content: trimmed,
      state: "done",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const loadingId = createMessageId("a");
    setMessages((prev) => [
      ...prev,
      { id: loadingId, role: "assistant", content: "Thinking…", state: "loading" },
    ]);

    setTimeout(() => {
      const matched = matchAssistantResponse(trimmed);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? { ...m, ...matched, state: "done" }
            : m,
        ),
      );
      setIsLoading(false);
    }, 600);
  };

  return (
    <aside aria-label="Learning Assistant Chatbot" className="relative">
      {/* Floating trigger button */}
      <div className="fixed bottom-5 right-5 z-40 sm:bottom-6 sm:right-6">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "group flex h-13 w-13 items-center justify-center rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            isOpen
              ? "bg-muted text-foreground hover:bg-muted/80"
              : "bg-gradient-to-r from-primary to-accent text-white hover:scale-105 hover:shadow-primary/25",
          )}
          aria-label={isOpen ? "Close learning assistant" : "Open learning assistant"}
          aria-expanded={isOpen}
          aria-controls="floating-assistant-panel"
        >
          {isOpen ? (
            <XIcon width={22} height={22} />
          ) : (
            <span className="relative flex items-center justify-center">
              <SparklesIcon width={22} height={22} className="transition-transform group-hover:rotate-12" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
              </span>
            </span>
          )}
        </button>
      </div>

      {/* Floating chat panel */}
      {isOpen && (
        <div
          id="floating-assistant-panel"
          role="dialog"
          aria-modal="false"
          aria-label="Reltroner Learning Assistant"
          className="fixed bottom-20 right-4 z-40 flex h-[32rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all duration-200 sm:bottom-22 sm:right-6 sm:w-96"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-background-elevated/70 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white shadow-xs">
                <SparklesIcon width={16} height={16} />
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-foreground">
                    Reltroner Assistant
                  </h3>
                  <Badge tone="neutral" className="text-[10px] py-0 px-1.5">
                    Demo
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Simulated Learning Companion
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/assistant"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                title="Open full screen assistant"
                aria-label="Open full screen assistant"
              >
                <ExternalLinkIcon width={15} height={15} />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                aria-label="Close assistant"
              >
                <XIcon width={16} height={16} />
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex flex-col gap-1.5",
                  m.role === "user" ? "ml-auto max-w-[85%] items-end" : "mr-auto max-w-[90%] items-start",
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2.5 text-xs leading-5 sm:text-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-muted/40 text-foreground",
                  )}
                >
                  {m.content}
                </div>

                {m.sources && m.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {m.sources.map((s) => (
                      <Link
                        key={s.href}
                        href={s.href}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/5"
                      >
                        <ExternalLinkIcon width={10} height={10} />
                        {s.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompt suggestions chips */}
          <div className="border-t border-border/60 bg-background/50 px-3 py-2">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Suggested questions:
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {suggestedPrompts.slice(0, 3).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSend(prompt)}
                  className="shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground hover:bg-primary/5 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="border-t border-border p-3 bg-card"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about courses, lessons, or concepts…"
                disabled={isLoading}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || isLoading}
                className="h-8 px-3 shrink-0"
                aria-label="Send message"
              >
                <SendIcon width={14} height={14} />
              </Button>
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground text-center">
              Prototype simulation · No live backend or AI mutation
            </p>
          </form>
        </div>
      )}
    </aside>
  );
}
