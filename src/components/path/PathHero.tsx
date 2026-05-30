import Link from "next/link";

import { Heading } from "@/components/ui/Heading";

type BreadcrumbItem = Readonly<{
  label: string;
  href?: string;
}>;

type PathHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  level?: string;
  breadcrumbs?: readonly BreadcrumbItem[];
  actions?: React.ReactNode;
  aside?: React.ReactNode;
};

export function PathHero({
  eyebrow,
  title,
  description,
  level,
  breadcrumbs,
  actions,
  aside,
}: PathHeroProps) {
  return (
    <section
      aria-labelledby="path-hero-title"
      className="overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-[radial-gradient(circle_at_top_left,rgba(244,244,245,0.95),rgba(255,255,255,1)_40%,rgba(250,250,250,1)_72%)] p-8 shadow-[0_32px_90px_-56px_rgba(24,24,27,0.45)] sm:p-10 lg:p-12"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-end">
        <div className="space-y-5">
          {breadcrumbs ? (
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                {breadcrumbs.map((breadcrumb, index) => {
                  const isLastItem = index === breadcrumbs.length - 1;

                  return (
                    <li key={`${breadcrumb.label}-${index}`} className="flex items-center gap-2">
                      {breadcrumb.href && !isLastItem ? (
                        <Link
                          href={breadcrumb.href}
                          className="rounded-sm transition hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950"
                        >
                          {breadcrumb.label}
                        </Link>
                      ) : (
                        <span aria-current={isLastItem ? "page" : undefined}>
                          {breadcrumb.label}
                        </span>
                      )}
                      {!isLastItem ? <span aria-hidden="true">/</span> : null}
                    </li>
                  );
                })}
              </ol>
            </nav>
          ) : null}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                {eyebrow}
              </p>
              {level ? (
                <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  {level}
                </span>
              ) : null}
            </div>
            <div id="path-hero-title">
              <Heading level={1} className="max-w-3xl text-balance sm:text-6xl">
                {title}
              </Heading>
            </div>
            <p className="max-w-3xl text-lg leading-8 text-zinc-600 sm:text-xl">{description}</p>
          </div>
          {actions ? <div className="flex flex-wrap gap-4">{actions}</div> : null}
        </div>
        {aside ? <div>{aside}</div> : null}
      </div>
    </section>
  );
}
