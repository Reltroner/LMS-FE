import { Badge } from "@/components/ui/Badge";
import { Heading } from "@/components/ui/Heading";
import { AuditExplorer } from "@/components/admin/AuditExplorer";

export const metadata = { title: "Audit Explorer" };

export default function AuditPage() {
  return (
    <>
      <div>
        <Badge tone="accent">Audit Service</Badge>
        <Heading level={1} className="mt-2">Audit Explorer</Heading>
        <p className="mt-1 text-sm text-muted-foreground">
          Search and inspect append-only audit events with provenance.
        </p>
      </div>
      <div className="mt-6">
        <AuditExplorer />
      </div>
    </>
  );
}
