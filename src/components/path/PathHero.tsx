import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
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

function formatLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

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
      className="overflow-hidden rounded-[2rem] border border-border bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_38%),linear-gradient(135deg,#ffffff,#f8fbff)] p-6 shadow-[0_30px_90px_-62px_rgba(15,23,42,0.55)] sm:p-8 lg:p-10"
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
              <Badge tone="primary">{eyebrow}</Badge>
              {level ? <Badge tone="accent">{formatLabel(level)}</Badge> : null}
            </div>
            <div id="path-hero-title">
              <Heading level={1} className="max-w-3xl text-balance sm:text-6xl">
                {title}
              </Heading>
            </div>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
              {description}
            </p>
          </div>
          {actions ? <div className="flex flex-wrap gap-4">{actions}</div> : null}
        </div>
        {aside ? <div>{aside}</div> : null}
      </div>
    </section>
  );
}
