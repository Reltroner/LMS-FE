import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Container } from "@/components/ui/Container";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  breadcrumb?: ReactNode;
  children?: ReactNode;
  className?: string;
};

// Editorial page opening: eyebrow, one h1, a short lede, actions, and optional art beside it.
export function PageHero({ eyebrow, title, lede, actions, aside, breadcrumb, children, className }: PageHeroProps) {
  return (
    <section className={cn("pb-10 pt-10 sm:pt-14 lg:pb-14", className)}>
      <Container>
        {breadcrumb}
        <div className={cn("grid gap-10", aside && "lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center")}>
          <div className="min-w-0">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h1>
            {lede && <div className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">{lede}</div>}
            {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
            {children}
          </div>
          {aside && <div className="min-w-0">{aside}</div>}
        </div>
      </Container>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, lede, id, action }: {
  eyebrow?: string; title: ReactNode; lede?: ReactNode; id?: string; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 id={id} className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
        {lede && <p className="mt-3 text-base leading-7 text-muted-foreground">{lede}</p>}
      </div>
      {action}
    </div>
  );
}
