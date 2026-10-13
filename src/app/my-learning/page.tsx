"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import {
  BookIcon,
  BookmarkFilledIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
} from "@/components/ui/icons";
import { mockBookmarks, mockEnrollments } from "@/lib/fixtures/learner";
import { cn } from "@/lib/utils/cn";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statusTone = {
  active: "success",
  completed: "primary",
  paused: "warning",
} as const;

type FilterTab = "all" | "active" | "completed" | "bookmarks";

export default function MyLearningPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const inProgressCourses = mockEnrollments.filter((e) => e.status === "active");
  const completedCourses = mockEnrollments.filter((e) => e.status === "completed");

  return (
    <>
      <Section className="pb-4 pt-10">
        <Container size="md">
          <div className="flex items-center gap-2">
            <Badge tone="accent">Learner Hub</Badge>
            <Badge tone="neutral">Simulated Mock State</Badge>
          </div>
          <Heading level={1} className="mt-3">
            My Learning
          </Heading>
          <p className="mt-2 text-sm text-muted-foreground">
            Track your enrolled courses, monitor your module progress, and review saved lesson bookmarks.
          </p>

          {/* Filter Tabs Navigation */}
          <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-3" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-semibold transition",
                activeTab === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border",
              )}
            >
              All Courses ({mockEnrollments.length})
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "active"}
              onClick={() => setActiveTab("active")}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-semibold transition",
                activeTab === "active"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border",
              )}
            >
              In Progress ({inProgressCourses.length})
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "completed"}
              onClick={() => setActiveTab("completed")}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-semibold transition",
                activeTab === "completed"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border",
              )}
            >
              Completed ({completedCourses.length})
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "bookmarks"}
              onClick={() => setActiveTab("bookmarks")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition",
                activeTab === "bookmarks"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border",
              )}
            >
              <BookmarkFilledIcon width={13} height={13} />
              Bookmarks ({mockBookmarks.length})
            </button>
          </div>
        </Container>
      </Section>

      {/* Courses Display */}
      {activeTab !== "bookmarks" && (
        <Section className="py-4">
          <Container size="md">
            {activeTab === "completed" && completedCourses.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircleIcon width={32} height={32} className="mx-auto text-muted-foreground" />
                <h3 className="mt-3 text-base font-semibold text-foreground">
                  No completed courses yet
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Keep progressing through your active enrollments to earn your course deliverables.
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab("active")}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    View in-progress courses →
                  </button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {(activeTab === "all"
                  ? mockEnrollments
                  : activeTab === "active"
                  ? inProgressCourses
                  : completedCourses
                ).map((e) => (
                  <Card key={e.id} className="p-5 sm:p-6 transition hover:border-primary/20">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white">
                          <BookIcon width={22} height={22} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-foreground text-lg">
                              {e.courseTitle}
                            </h3>
                            <Badge tone={statusTone[e.status]}>{e.status}</Badge>
                            <Badge tone="neutral">{e.courseLevel}</Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Enrolled on {formatDate(e.enrolledAt)} · Up next:{" "}
                            <span className="font-medium text-foreground">
                              {e.lastVisitedLessonTitle}
                            </span>
                          </p>

                          {/* Progress bar */}
                          <div className="mt-3 max-w-md space-y-1">
                            <div className="flex justify-between text-xs font-medium text-muted-foreground">
                              <span>
                                {e.completedLessons} of {e.totalLessons} lessons completed
                              </span>
                              <span className="font-semibold text-foreground">{e.progressPercent}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-background-elevated">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                                style={{ width: `${e.progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                        <ButtonLink
                          href={`/courses/${e.courseSlug}/lessons/${e.lastVisitedLessonSlug}`}
                          size="sm"
                          className="gap-1.5"
                        >
                          <PlayIcon width={14} height={14} />
                          Resume Lesson
                        </ButtonLink>
                        <Link
                          href={`/courses/${e.courseSlug}`}
                          className="text-xs font-medium text-muted-foreground hover:text-primary hover:underline"
                        >
                          View syllabus
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Container>
        </Section>
      )}

      {/* Bookmarks Section (Visible on 'all' or 'bookmarks' tab) */}
      {(activeTab === "all" || activeTab === "bookmarks") && (
        <Section className="py-6">
          <Container size="md">
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <BookmarkFilledIcon width={18} height={18} className="text-accent" />
                <Heading level={2} className="text-lg">Saved Bookmarks</Heading>
              </div>
              <span className="text-xs text-muted-foreground">
                {mockBookmarks.length} bookmarked items
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {mockBookmarks.map((b) => (
                <Card key={b.id} className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ClockIcon width={13} height={13} />
                      Saved on {formatDate(b.createdAt)}
                    </div>
                    <h4 className="mt-2 font-bold text-foreground">
                      <Link
                        href={`/courses/${b.courseSlug}/lessons/${b.lessonSlug}`}
                        className="hover:text-primary"
                      >
                        {b.lessonTitle}
                      </Link>
                    </h4>
                    <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                      {b.courseTitle}
                    </p>
                    {b.note && (
                      <p className="mt-2 text-xs italic text-muted-foreground/80 bg-muted/30 rounded-lg p-2 border border-border/50">
                        &ldquo;{b.note}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex justify-end">
                    <ButtonLink
                      href={`/courses/${b.courseSlug}/lessons/${b.lessonSlug}`}
                      size="sm"
                      variant="secondary"
                    >
                      Go to lesson →
                    </ButtonLink>
                  </div>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
