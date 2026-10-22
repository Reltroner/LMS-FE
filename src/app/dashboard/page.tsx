import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import {
  ArrowRightIcon,
  BookIcon,
  CompassIcon,
  PlayIcon,
} from "@/components/ui/icons";
import { mockEnrollments, mockLearner } from "@/lib/fixtures/learner";
import { getPublishedPaths } from "@/lib/fixtures/paths";

export const metadata = {
  title: "Learner Dashboard",
  description: "Personalized learner dashboard with progress continuation and active courses.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const activeEnrollments = mockEnrollments.filter((e) => e.status === "active");
  // The primary "last studied" course is the first active enrollment
  const primaryCourse = activeEnrollments[0] || mockEnrollments[0];

  const totalCompleted = mockEnrollments.reduce((s, e) => s + e.completedLessons, 0);
  const totalLessons = mockEnrollments.reduce((s, e) => s + e.totalLessons, 0);
  const overallProgress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  // Active path context
  const publishedPaths = getPublishedPaths();
  const activePath = publishedPaths[0];

  return (
    <>
      {/* Learner Welcome Header */}
      <Section className="pb-4 pt-10">
        <Container size="md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge tone="accent">Learner workspace</Badge>
                <Badge tone="neutral">Simulated Mock State</Badge>
              </div>
              <Heading level={1} className="mt-3">
                Welcome back, {mockLearner.displayName.split(" ")[0]}
              </Heading>
              <p className="mt-1 text-sm text-muted-foreground">
                Track your active coursework, continue where you left off, and follow your learning path.
              </p>
            </div>

            <ButtonLink href="/my-learning" variant="secondary" size="sm">
              <BookIcon width={16} height={16} />
              View all enrollments
            </ButtonLink>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Overall Progress</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{overallProgress}%</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{totalCompleted} of {totalLessons} lessons</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Active Courses</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{activeEnrollments.length}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">In progress</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Current Domain</p>
              <p className="mt-1 text-base font-bold text-foreground truncate">Creative Architect</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Level: Beginner</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Mentorship</p>
              <Link href="/mentorship" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                Find a mentor <ArrowRightIcon width={12} height={12} />
              </Link>
              <p className="mt-0.5 text-[11px] text-muted-foreground">1-on-1 creative reviews</p>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Section 1: DOMINANT "CONTINUE LEARNING" HERO ACTION (Codepolitan pattern) */}
      {primaryCourse && (
        <Section className="py-4">
          <Container size="md">
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Last Studied · Priority Action
                </h2>
              </div>
              <span className="text-xs text-muted-foreground">
                Last opened {formatDate(primaryCourse.lastVisitedAt)}
              </span>
            </div>

            <Card className="relative overflow-hidden border-primary/30 p-6 sm:p-7 shadow-md bg-gradient-to-br from-card via-card to-primary/5">
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="primary">Current Course</Badge>
                    <span className="text-xs font-medium text-muted-foreground">
                      {primaryCourse.courseTitle}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-foreground tracking-tight">
                      {primaryCourse.lastVisitedLessonTitle}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Lesson {primaryCourse.completedLessons + 1} of {primaryCourse.totalLessons} · Ready to continue your progress
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="max-w-xl space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                      <span>Course Completion</span>
                      <span className="font-semibold text-foreground">{primaryCourse.progressPercent}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-background-elevated">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `${primaryCourse.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Primary Dominant CTA */}
                <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col lg:items-end">
                  <ButtonLink
                    href={`/courses/${primaryCourse.courseSlug}/lessons/${primaryCourse.lastVisitedLessonSlug}`}
                    size="lg"
                    className="gap-2 shadow-md hover:scale-[1.02] transition-transform"
                  >
                    <PlayIcon width={18} height={18} />
                    Continue Learning
                  </ButtonLink>
                  <Link
                    href={`/courses/${primaryCourse.courseSlug}`}
                    className="text-center text-xs font-medium text-muted-foreground hover:text-primary hover:underline py-1"
                  >
                    View course syllabus →
                  </Link>
                </div>
              </div>
            </Card>
          </Container>
        </Section>
      )}

      {/* Section 2: Active Enrollments */}
      <Section className="py-4">
        <Container size="md">
          <div className="flex items-center justify-between pb-4">
            <Heading level={2} className="text-xl">Enrolled Courses</Heading>
            <Link
              href="/my-learning"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Manage all ({mockEnrollments.length}) →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {mockEnrollments.length === 0 ? (
              <Card className="col-span-2 p-8 text-center">
                <BookIcon width={32} height={32} className="mx-auto text-muted-foreground" />
                <h3 className="mt-3 text-base font-semibold text-foreground">
                  No active enrollments
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Explore available learning paths and courses to begin your studies.
                </p>
                <div className="mt-4">
                  <ButtonLink href="/courses" size="sm">
                    Browse courses
                  </ButtonLink>
                </div>
              </Card>
            ) : (
              mockEnrollments.map((course) => {
                const isCurrent = course.id === primaryCourse?.id;
                return (
                  <Card
                    key={course.id}
                    className={`flex flex-col justify-between p-5 ${
                      isCurrent ? "border-primary/40 bg-primary/5" : ""
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Badge tone={course.status === "active" ? "success" : "neutral"}>
                          {course.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {course.progressPercent}% complete
                        </span>
                      </div>

                      <h3 className="mt-3 font-semibold text-foreground">
                        <Link href={`/courses/${course.courseSlug}`} className="hover:text-primary">
                          {course.courseTitle}
                        </Link>
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Next: {course.lastVisitedLessonTitle}
                      </p>

                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-background-elevated">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${course.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
                      <span className="text-xs text-muted-foreground">
                        {course.completedLessons}/{course.totalLessons} lessons
                      </span>
                      <ButtonLink
                        href={`/courses/${course.courseSlug}/lessons/${course.lastVisitedLessonSlug}`}
                        size="sm"
                        variant={isCurrent ? "primary" : "secondary"}
                      >
                        <PlayIcon width={14} height={14} />
                        Resume
                      </ButtonLink>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </Container>
      </Section>

      {/* Section 3: Learning Path Context */}
      <Section className="py-4">
        <Container size="md">
          <div className="flex items-center justify-between pb-4">
            <Heading level={2} className="text-xl">Your Learning Path</Heading>
            <Link
              href="/paths"
              className="text-sm font-semibold text-primary hover:underline"
            >
              View paths →
            </Link>
          </div>

          {activePath ? (
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white">
                  <CompassIcon width={24} height={24} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge tone="accent">Sequence in progress</Badge>
                    <span className="text-xs text-muted-foreground">~{activePath.estimatedHours}h total effort</span>
                  </div>
                  <h3 className="mt-1.5 text-lg font-bold text-foreground">
                    {activePath.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activePath.summary}
                  </p>

                  {/* Course Sequence progression steps */}
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                          1
                        </span>
                        <span className="text-xs font-semibold text-primary">In Progress</span>
                      </div>
                      <p className="mt-1.5 text-xs font-medium text-foreground">
                        Foundation
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                          2
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">Upcoming</span>
                      </div>
                      <p className="mt-1.5 text-xs font-medium text-foreground">
                        World System
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                          3
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">Upcoming</span>
                      </div>
                      <p className="mt-1.5 text-xs font-medium text-foreground">
                        Active World
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <CompassIcon width={32} height={32} className="mx-auto text-muted-foreground" />
              <h3 className="mt-3 text-base font-semibold text-foreground">
                No active learning path
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Follow a structured curriculum sequence to build systemic creative capabilities.
              </p>
              <div className="mt-4">
                <ButtonLink href="/paths" size="sm">
                  Explore learning paths
                </ButtonLink>
              </div>
            </Card>
          )}
        </Container>
      </Section>
    </>
  );
}
