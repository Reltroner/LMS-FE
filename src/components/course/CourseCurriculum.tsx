"use client";

import { useState } from "react";
import Link from "next/link";
import type { Course } from "@/types/course";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getLessonBySlug } from "@/lib/fixtures/lessons";
import {
  ChevronDownIcon,
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

const kindLabels: Record<string, string> = {
  lesson: "Lesson",
  lab: "Lab",
  checkpoint: "Checkpoint",
  capstone: "Capstone",
};

const kindTone: Record<string, "neutral" | "accent" | "warning" | "primary"> = {
  lesson: "neutral",
  lab: "accent",
  checkpoint: "warning",
  capstone: "primary",
};

export function CourseCurriculum({ course }: { course: Course }) {
  const [openModules, setOpenModules] = useState<Set<string>>(
    new Set([course.modules[0]?.id].filter(Boolean) as string[]),
  );

  const toggle = (id: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-background-elevated/50 px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">Curriculum</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {course.modules.length} modules ·{" "}
          {course.modules.reduce(
            (n, m) => n + m.lessonSlugs.length,
            0,
          )}{" "}
          lessons
        </p>
      </div>
      <ul className="divide-y divide-border">
        {course.modules.map((mod, idx) => {
          const lessons = mod.lessonSlugs
            .map((slug) => getLessonBySlug(slug))
            .filter(Boolean);
          const isOpen = openModules.has(mod.id);
          return (
            <li key={mod.id}>
              <button
                type="button"
                onClick={() => toggle(mod.id)}
                className="flex w-full items-center gap-3 px-6 py-4 text-left transition hover:bg-primary/5"
                aria-expanded={isOpen}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{mod.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {lessons.length} lessons · {mod.summary}
                  </p>
                </div>
                <ChevronDownIcon
                  width={18}
                  height={18}
                  className={cn(
                    "shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              {isOpen && (
                <ul className="space-y-1 px-6 pb-4">
                  {lessons.map((lesson) => (
                    <li key={lesson!.id}>
                      <Link
                        href={`/courses/${course.slug}/lessons/${lesson!.slug}`}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-primary/5"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground ring-1 ring-border group-hover:text-primary">
                          <PlayIcon width={14} height={14} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {lesson!.title}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2">
                            <Badge tone={kindTone[lesson!.kind]}>
                              {kindLabels[lesson!.kind]}
                            </Badge>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <ClockIcon width={12} height={12} />
                              {lesson!.durationMinutes}m
                            </span>
                          </div>
                        </div>
                        <CheckCircleIcon
                          width={16}
                          height={16}
                          className="text-muted-foreground/30"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                  {lessons.length === 0 && (
                    <li className="px-3 py-3 text-sm text-muted-foreground">
                      Lessons for this module are not yet published.
                    </li>
                  )}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
