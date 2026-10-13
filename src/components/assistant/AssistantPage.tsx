"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Section } from "@/components/ui/Section";
import {
  AlertIcon,
  InfoIcon,
  LockIcon,
  SparklesIcon,
  SendIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import {
  type Message,
  seedMessages,
  suggestedPrompts,
  matchAssistantResponse,
  createMessageId,
} from "@/lib/assistant/assistant-data";

export function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { id: createMessageId("u"), role: "user", content: trimmed, state: "done" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Simulate streaming/loading then a deterministic response
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
    }, 700);
  };

  const suggestions = suggestedPrompts;

  return (
    <Section className="pt-4">
      <Container size="md">
        <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
          {/* Chat */}
          <div className="flex flex-col rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                  <SparklesIcon width={18} height={18} />
                </span>
                <div>
                  <h2 className="font-semibold text-foreground">Reltroner Assistant</h2>
                  <p className="text-xs text-muted-foreground">Conceptual · learning support only</p>
                </div>
                <Badge tone="neutral" className="ml-auto">prototype</Badge>
              </div>
            </div>

            <div className="flex h-[28rem] flex-col gap-4 overflow-y-auto p-5">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex max-w-[85%] flex-col gap-2",
                    m.role === "user" ? "ml-auto items-end" : "items-start",
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm leading-6",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background-elevated text-foreground",
                    )}
                  >
                    {m.content}
                  </div>
                  {m.sources && m.sources.length > 0 && (
                    <div className="rounded-xl border border-border p-3 text-xs">
                      <p className="font-medium text-foreground">Sources</p>
                      <ul className="mt-1 space-y-1">
                        {m.sources.map((s) => (
                          <li key={s.href}>
                            <a
                              href={s.href}
                              target={s.href.startsWith("http") ? "_blank" : undefined}
                              rel="noreferrer"
                              className="text-primary hover:underline"
                            >
                              → {s.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(input)}
                  placeholder="Ask about course content…"
                  aria-label="Ask the assistant"
                />
                <Button onClick={() => send(input)} disabled={!input.trim() || isLoading}>
                  <SendIcon width={16} height={16} />
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: limitations */}
          <aside className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <InfoIcon width={18} height={18} className="text-primary" />
                <h3 className="font-semibold text-foreground">What this assistant does</h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>· Explains published lesson concepts</li>
                <li>· Points to lessons and external references</li>
                <li>· Suggests next lessons within a course</li>
              </ul>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2">
                <LockIcon width={18} height={18} className="text-accent-foreground" />
                <h3 className="font-semibold text-foreground">What it cannot do</h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>· Mark lessons complete or change progress</li>
                <li>· Enroll you or modify bookings</li>
                <li>· Access draft or unpublished content</li>
                <li>· Act as a grader or authority on grades</li>
              </ul>
            </Card>

            <div className="rounded-xl border border-amber-400/30 bg-amber-500/5 p-4 text-xs text-amber-700 dark:text-amber-300">
              <div className="flex items-center gap-2 font-semibold">
                <AlertIcon width={15} height={15} />
                Permission-aware
              </div>
              <p className="mt-1.5 leading-5">
                The assistant is scoped by your permissions. Actions that
                require authorization are handled by backend services, never by
                this interface alone.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
