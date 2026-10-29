import Link from "next/link";
import { Fragment } from "react";

export type Crumb = Readonly<{ label: string; href?: string }>;

// The last crumb is the current page and is not a link.
export function Breadcrumb({ items, className }: { items: readonly Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className ?? "mb-6"}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 && <li aria-hidden="true">/</li>}
            <li className="min-w-0">
              {item.href ? (
                <Link href={item.href} className="hover:text-primary">{item.label}</Link>
              ) : (
                <span aria-current="page" className="font-medium text-foreground">{item.label}</span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
