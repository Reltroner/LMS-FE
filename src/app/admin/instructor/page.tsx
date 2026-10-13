import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Heading";
import {
  BookIcon,
  LockIcon,
  FileTextIcon,
  AlertIcon,
  LayersIcon,
} from "@/components/ui/icons";

export const metadata = { title: "Instructor View" };

const allowed = [
  { icon: LayersIcon, title: "View assigned courses", desc: "Read-only access to courses you are assigned to teach." },
  { icon: FileTextIcon, title: "Review learner submissions", desc: "View submitted work within your assigned scope." },
  { icon: BookIcon, title: "Publish lesson drafts", desc: "Submit lesson drafts for editorial review (no direct publish)." },
];

const disallowed = [
  "Canonical course CRUD (create/update/delete courses)",
  "Direct lesson publishing without editorial review",
  "Principal or role management",
  "Mentorship booking lifecycle actions",
  "Global audit access",
];

export default function InstructorViewPage() {
  return (
    <>
      <div className="flex items-center gap-2">
        <Badge tone="accent">Persona: Limited Instructor</Badge>
        <Badge tone="warning">Permission-scoped</Badge>
      </div>
      <Heading level={1} className="mt-2">Instructor Console</Heading>
      <p className="mt-1 text-sm text-muted-foreground">
        Functions conceptually available to a permission-limited instructor.
        Canonical course CRUD is intentionally not present.
      </p>

      <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
        <AlertIcon width={18} height={18} className="mt-0.5 shrink-0" />
        <p>
          This view intentionally omits canonical course creation, editing, and
          deletion. Catalog publication is governed by editorial workflow and
          the Learning Service, not by browser-based CRUD in this console.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Allowed */}
        <Card className="p-6">
          <h2 className="font-semibold text-foreground">Available functions</h2>
          <ul className="mt-4 space-y-3">
            {allowed.map((a) => {
              const Icon = a.icon;
              return (
                <li key={a.title} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon width={17} height={17} />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{a.title}</p>
                    <p className="text-sm text-muted-foreground">{a.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Disallowed */}
        <Card className="p-6">
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <LockIcon width={18} height={18} className="text-red-500" />
            Not available in this role
          </h2>
          <ul className="mt-4 space-y-2">
            {disallowed.map((d) => (
              <li key={d} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                {d}
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-lg bg-background-elevated p-3 text-xs text-muted-foreground">
            Restrictions are enforced by backend authorization. Removing UI
            controls here does not grant or revoke capabilities.
          </p>
        </Card>
      </div>
    </>
  );
}
