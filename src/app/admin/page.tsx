import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading";
import {
  UsersIcon,
  CalendarIcon,
  DatabaseIcon,
  BookIcon,
  AlertIcon,
} from "@/components/ui/icons";
import {
  mockPrincipals,
  mockBookings,
  mockAuditEvents,
} from "@/lib/fixtures/admin";

export const metadata = { title: "Admin Overview" };

export default function AdminOverviewPage() {
  const activePrincipals = mockPrincipals.filter((p) => p.status === "active").length;
  const pendingBookings = mockBookings.filter((b) => b.status === "pending").length;
  const recentAudit = mockAuditEvents.length;

  const stats = [
    { label: "Active principals", value: activePrincipals, icon: UsersIcon, tone: "primary" },
    { label: "Pending bookings", value: pendingBookings, icon: CalendarIcon, tone: "accent" },
    { label: "Audit events (24h)", value: recentAudit, icon: DatabaseIcon, tone: "neutral" },
    { label: "Published courses", value: 3, icon: BookIcon, tone: "success" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Badge tone="warning">Synthetic mock data</Badge>
          <Heading level={1} className="mt-2">Admin Overview</Heading>
          <p className="mt-1 text-sm text-muted-foreground">
            Capability-aware summary. No real backend data is shown.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon width={18} height={18} />
                </span>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent audit events</h2>
            <Badge tone="neutral">provenance: audit service</Badge>
          </div>
          <ul className="mt-4 space-y-3">
            {mockAuditEvents.slice(0, 4).map((e) => (
              <li key={e.id} className="flex items-start gap-3 text-sm">
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    e.result === "success"
                      ? "bg-emerald-500"
                      : e.result === "denied"
                        ? "bg-red-500"
                        : "bg-amber-500"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-foreground">
                    <span className="font-medium">{e.action}</span>{" "}
                    <span className="text-muted-foreground">by {e.actor}</span>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {new Date(e.timestamp).toLocaleString()} · {e.service}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Pending bookings</h2>
            <Badge tone="warning">{pendingBookings} awaiting</Badge>
          </div>
          <ul className="mt-4 space-y-3">
            {mockBookings.filter((b) => b.status === "pending").map((b) => (
              <li key={b.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{b.learnerName}</p>
                  <Badge tone="warning">{b.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{b.offeringTitle}</p>
                <p className="text-xs text-muted-foreground">{b.date}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
        <AlertIcon width={18} height={18} className="mt-0.5 shrink-0" />
        <p>
          This admin console is a prototype. In production it runs on a
          separate origin (<code>lms-admin.reltroner.com</code>) with its own
          Keycloak client. Hiding controls here is <strong>not</strong> a
          substitute for backend authorization.
        </p>
      </div>
    </>
  );
}
