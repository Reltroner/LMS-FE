import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import {
  ShieldIcon,
  UsersIcon,
  CalendarIcon,
  DatabaseIcon,
  LayoutIcon,
  HomeIcon,
  ExternalLinkIcon,
} from "@/components/ui/icons";

const nav = [
  { href: "/admin", label: "Overview", icon: HomeIcon, exact: true },
  { href: "/admin/principals", label: "Principals", icon: UsersIcon },
  { href: "/admin/mentorship", label: "Mentorship", icon: CalendarIcon },
  { href: "/admin/audit", label: "Audit", icon: DatabaseIcon },
  { href: "/admin/instructor", label: "Instructor view", icon: LayoutIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background-elevated/40">
      <div className="mx-auto flex max-w-7xl gap-0">
        {/* Sidebar */}
        <aside className="sticky top-[3.5rem] hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r border-border bg-card md:block">
          <div className="flex h-full flex-col">
            <div className="border-b border-border p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white">
                  <ShieldIcon width={16} height={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Admin Console</p>
                  <p className="text-[11px] text-muted-foreground">lms-admin.reltroner.com</p>
                </div>
              </div>
              <Badge tone="warning" className="mt-3 w-full justify-center">
                Prototype only
              </Badge>
            </div>

            <nav className="flex-1 space-y-1 p-3" aria-label="Admin navigation">
              {nav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-primary/5 hover:text-foreground"
                  >
                    <Icon width={18} height={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-border p-4 text-[11px] text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <ExternalLinkIcon width={12} height={12} />
                Separate origin
              </p>
              <p className="mt-1 leading-4">
                Admin is a distinct frontend. No learner routes are used as
                security boundaries.
              </p>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">
          <div className="p-4 md:hidden">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
              <ShieldIcon width={16} height={16} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">Admin Console</span>
              <Badge tone="warning" className="ml-auto">Prototype</Badge>
            </div>
          </div>
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
