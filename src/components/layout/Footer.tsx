import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { GraduationIcon } from "@/components/ui/icons";

const footerLinks = {
  Learn: [
    { label: "Courses", href: "/courses" },
    { label: "Learning Paths", href: "/paths" },
    { label: "Search", href: "/search" },
    { label: "Mentorship", href: "/mentorship" },
  ],
  Academy: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Learning", href: "/my-learning" },
    { label: "Account", href: "/account" },
    { label: "Assistant", href: "/assistant" },
  ],
  Admin: [
    { label: "Admin Overview", href: "/admin" },
    { label: "Principals", href: "/admin/principals" },
    { label: "Audit", href: "/admin/audit" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card/50">
      <Container>
        <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                <GraduationIcon width={20} height={20} />
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-sm font-bold text-foreground">
                  Reltroner
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Learning Academy
                </span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground">
              Systems thinking, worldbuilding methodology, and creative constraints
              for independent creators.
            </p>
            <p className="text-xs text-muted-foreground">
              Identity is managed at{" "}
              <code className="rounded bg-background px-1.5 py-0.5 font-mono">
                auth.reltroner.com
              </code>
              .
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© 2026 Reltroner. Design prototype only.</p>
          <p>
            Backend API gateway:{" "}
            <code className="rounded bg-background px-1.5 py-0.5 font-mono">
              lms-api.reltroner.com
            </code>{" "}
            · Admin:{" "}
            <code className="rounded bg-background px-1.5 py-0.5 font-mono">
              lms-admin.reltroner.com
            </code>
          </p>
        </div>
      </Container>
    </footer>
  );
}
