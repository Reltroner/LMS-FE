import type { AnchorHTMLAttributes, ReactNode } from "react";
import { ArrowUpRightIcon } from "./icons";

type ExternalLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel"> & {
  href: string;
  children: ReactNode;
  iconClassName?: string;
};

// Another site in a new tab: visible arrow, spoken hint, and no opener or referrer leak.
export function ExternalLink({ href, children, iconClassName, ...rest }: ExternalLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
      <ArrowUpRightIcon width={14} height={14} className={iconClassName ?? "shrink-0"} />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
