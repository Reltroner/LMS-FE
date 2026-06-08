import Image from "next/image";

import { CourseCard } from "@/components/course/CourseCard";
import { PathCard } from "@/components/path/PathCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { getAllCourses, getCourseBySlug } from "@/lib/content/course-registry";
import { getLessonsByCourseSlug } from "@/lib/content/lesson-registry";
import { getAllPaths } from "@/lib/content/path-registry";
import { createMetadata } from "@/lib/seo/metadata";
import { site } from "@/lib/seo/site";
import { createOrganizationStructuredData } from "@/lib/seo/structured-data";
import type { Course } from "@/types/course";
import type { LearningPath } from "@/types/path";

export const metadata = createMetadata({
  description: site.description,
  path: "/",
});

const valueCards = [
  {
    title: "Engineering Skills",
    description:
      "Build foundations in backend systems, APIs, deployment thinking, and durable software practice.",
  },
  {
    title: "AI Skills",
    description:
      "Learn how to reason with AI tools, structure prompts, and integrate automation into real work.",
  },
  {
    title: "Project-Based Learning",
    description:
      "Move through practical lessons, labs, checkpoints, and capstones that produce usable outputs.",
  },
] as const;

function resolvePathMetrics(path: LearningPath) {
  const courses = path.courseSlugs
    .map((courseSlug) => getCourseBySlug(courseSlug))
    .filter((course): course is Course => Boolean(course));

  return {
    courseCount: courses.length,
    totalLessons: courses.reduce(
      (total, course) => total + getLessonsByCourseSlug(course.slug).length,
      0,
    ),
    totalDurationHours: courses.reduce((total, course) => total + course.estimatedHours, 0),
  };
}

export default function Home() {
  const courses = getAllCourses();
  const paths = getAllPaths();
  const totalLessons = courses.reduce(
    (total, course) => total + getLessonsByCourseSlug(course.slug).length,
    0,
  );

  return (
    <>
      <JsonLd id="home-organization-jsonld" data={createOrganizationStructuredData()} />
      <Section className="relative overflow-hidden pb-12 pt-10 sm:pt-14 lg:pb-16 lg:pt-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.82fr)] lg:items-center">
            <div className="space-y-8">
              <div className="space-y-5">
                <Badge tone="primary">Frontend-only learning system</Badge>
                <Heading level={1} className="max-w-4xl text-balance">
                  Reltroner Learning Academy
                </Heading>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                  Engineering skills, AI skills, and project-based learning for long-term
                  capability.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/courses">Explore Courses</ButtonLink>
                <ButtonLink href="/paths" variant="secondary">
                  View Learning Paths
                </ButtonLink>
              </div>
              <dl className="grid gap-4 sm:grid-cols-3">
                <Card className="p-5">
                  <dt className="text-sm font-medium text-muted-foreground">Courses</dt>
                  <dd className="mt-2 text-3xl font-semibold text-foreground">{courses.length}</dd>
                </Card>
                <Card className="p-5">
                  <dt className="text-sm font-medium text-muted-foreground">Lessons</dt>
                  <dd className="mt-2 text-3xl font-semibold text-foreground">{totalLessons}</dd>
                </Card>
                <Card className="p-5">
                  <dt className="text-sm font-medium text-muted-foreground">Paths</dt>
                  <dd className="mt-2 text-3xl font-semibold text-foreground">{paths.length}</dd>
                </Card>
              </dl>
            </div>

            <div className="relative">
              <div className="absolute inset-6 rounded-[2rem] bg-primary/10 blur-3xl" />
              <Card className="relative overflow-hidden p-4">
                <Image
                  src="/images/hero-grid.svg"
                  alt=""
                  width={720}
                  height={520}
                  className="aspect-[1.35] w-full rounded-[1.35rem] object-cover"
                />
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="py-12 sm:py-16">
        <Container>
          <div className="space-y-8">
            <div className="max-w-3xl space-y-3">
              <Badge tone="accent">Why learn here</Badge>
              <Heading>Designed for steady capability</Heading>
              <p className="text-lg leading-8 text-muted-foreground">
                Clear pathways, readable lessons, and practical outputs keep the academy focused on
                skill growth instead of platform noise.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {valueCards.map((valueCard, index) => (
                <Card key={valueCard.title} className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
                    0{index + 1}
                  </div>
                  <h2 className="mt-6 text-xl font-semibold text-foreground">{valueCard.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {valueCard.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="py-12 sm:py-16">
        <Container>
          <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl space-y-3">
                <Badge tone="primary">Featured courses</Badge>
                <Heading>Start with a focused course</Heading>
                <p className="text-lg leading-8 text-muted-foreground">
                  Browse available courses from the static catalog and pick the next useful skill.
                </p>
              </div>
              <ButtonLink href="/courses" variant="secondary">
                View all courses
              </ButtonLink>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {courses.slice(0, 3).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="pb-16 pt-12 sm:pb-24 sm:pt-16">
        <Container>
          <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl space-y-3">
                <Badge tone="accent">Learning paths</Badge>
                <Heading>Follow a guided sequence</Heading>
                <p className="text-lg leading-8 text-muted-foreground">
                  Paths connect courses into a practical roadmap, so learners can move with less
                  guesswork.
                </p>
              </div>
              <ButtonLink href="/paths" variant="secondary">
                View all paths
              </ButtonLink>
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              {paths.map((path) => {
                const metrics = resolvePathMetrics(path);

                return (
                  <PathCard
                    key={path.id}
                    path={path}
                    courseCount={metrics.courseCount}
                    totalLessons={metrics.totalLessons}
                    totalDurationHours={metrics.totalDurationHours}
                  />
                );
              })}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
