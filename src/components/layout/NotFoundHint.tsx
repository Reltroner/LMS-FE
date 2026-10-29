"use client";

import { usePathname } from "next/navigation";

// The static 404 page is shared by every unknown URL; the address tells us what was probably meant.
export function NotFoundHint() {
  const pathname = usePathname() ?? "";
  const message = /^\/courses\/[^/]+\/lessons\//.test(pathname)
    ? "Lessons get an address only once they are published. This one is either planned or the link is mistyped."
    : /^\/(courses|paths)\//.test(pathname)
      ? "Only published courses and learning paths have pages here."
      : "The address may be mistyped, or the page may have moved.";
  return <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{message}</p>;
}
