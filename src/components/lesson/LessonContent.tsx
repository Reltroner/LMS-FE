import type { ContentBlock } from "@/lib/fixtures/lesson-content";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import {
  AlertIcon,
  CheckCircleIcon,
  InfoIcon,
  SparklesIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

export function LessonContent({ blocks, children }: {
  blocks?: readonly ContentBlock[];
  children?: ReactNode;
}) {
  return (
    <div className="prose-reltroner max-w-none">
      {children}
      {blocks?.map((block, i) => {
        switch (block.type) {
          case "heading":
            return block.level === 2 ? (
              <h2 key={i} id={`section-${i}`}>
                {block.text}
              </h2>
            ) : (
              <h3 key={i}>{block.text}</h3>
            );
          case "paragraph":
            return <p key={i}>{block.text}</p>;
          case "list":
            return block.ordered ? (
              <ol key={i} className="list-decimal">
                {block.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="list-disc">
                {block.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            );
          case "code":
            return (
              <pre key={i}>
                <code className={`language-${block.language ?? "text"}`}>
                  {block.code}
                </code>
              </pre>
            );
          case "callout": {
            const config = {
              info: { icon: InfoIcon, tone: "text-primary", bg: "bg-primary-soft border-primary/20" },
              tip: { icon: SparklesIcon, tone: "text-accent-foreground", bg: "bg-accent-soft border-accent/20" },
              warning: { icon: AlertIcon, tone: "text-warning", bg: "bg-warning-soft border-warning/20" },
            }[block.tone];
            const Icon = config.icon;
            return (
              <blockquote
                key={i}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-4 py-3 not-italic",
                  config.bg,
                )}
              >
                <Icon width={18} height={18} className={cn("mt-0.5 shrink-0", config.tone)} />
                <p className="m-0 text-sm">{block.text}</p>
              </blockquote>
            );
          }
          case "checkpoint":
            return (
              <Card key={i} className="my-6 border-primary/20 bg-primary-soft p-6">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon width={20} height={20} className="text-primary" />
                  <h3 className="m-0 text-lg font-semibold text-foreground">
                    {block.title}
                  </h3>
                </div>
                <ul className="mt-3 space-y-2">
                  {block.items.map((it, j) => (
                    <li key={j} className="flex gap-2 text-sm">
                      <span className="mt-0.5 text-primary">•</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
