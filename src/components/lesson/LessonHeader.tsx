import Link from "next/link";

import type { LessonDocument } from "@/lib/content/lesson-registry";
import { courseUrl } from "@/lib/routes/route-builders";

type LessonHeaderProps = {
  courseSlug: string;
  courseTitle: string;
  lesson: LessonDocument;
};

export function LessonHeader({ courseSlug, courseTitle, lesson }: LessonHeaderProps) {
  return (
    <header className="rounded-[2rem] border border-zinc-200 bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(250,250,250,1),rgba(244,244,245,0.78))] p-6 shadow-[0_24px_70px_-48px_rgba(24,24,27,0.35)] sm:p-8 lg:p-10">
      <nav aria-label="Breadcrumb" className="text-sm font-medium text-zinc-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/courses"
              className="rounded-sm hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
            >
              Courses
            </Link>
          </li>
          <li aria-hidden="true" className="text-zinc-400">
            &gt;
          </li>
          <li>
            <Link
              href={courseUrl(courseSlug)}
              className="rounded-sm hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
            >
              {courseTitle}
            </Link>
          </li>
          <li aria-hidden="true" className="text-zinc-400">
            &gt;
          </li>
          <li className="text-zinc-950">{lesson.title}</li>
        </ol>
      </nav>
      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {lesson.moduleTitle}
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-zinc-950 sm:text-5xl lg:text-6xl">
            {lesson.title}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-zinc-600">{lesson.summary}</p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2 lg:min-w-[20rem]">
          <div className="rounded-2xl border border-zinc-200 bg-white/80 px-4 py-4 backdrop-blur-sm">
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Module
            </dt>
            <dd className="mt-2 text-base font-semibold text-zinc-950">{lesson.moduleTitle}</dd>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white/80 px-4 py-4 backdrop-blur-sm">
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Duration
            </dt>
            <dd className="mt-2 text-base font-semibold text-zinc-950">{lesson.durationLabel}</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}
