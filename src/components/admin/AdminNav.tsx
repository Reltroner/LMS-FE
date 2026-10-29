"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/admin/", label: "Overview" },
  { href: "/admin/instructor/", label: "Instructor" },
  { href: "/admin/principals/", label: "Principals" },
  { href: "/admin/mentorship/", label: "Mentorship" },
  { href: "/admin/audit/", label: "Audit" },
];

export function AdminNav() {
  const pathname = (usePathname() ?? "").replace(/\/?$/, "/");
  return (
    <nav aria-label="Administration">
      <ul className="flex gap-1 overflow-x-auto md:flex-col">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href} className="shrink-0">
              <Link href={item.href} aria-current={active ? "page" : undefined}
                className={cn("block rounded-xl px-3 py-2 text-sm transition",
                  active ? "bg-primary-soft font-semibold text-primary" : "text-muted-foreground hover:bg-background-elevated hover:text-foreground")}>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
