import { Card } from "@/components/ui/Card";
import { StatusNotice } from "@/components/ui/StatusNotice";

// What an administrative role will be able to do once a server enforces access. A static site
// cannot authorize anyone, so these pages load no records and offer no controls.
export function AdminCapabilityPage({ eyebrow, title, summary, operations }: {
  eyebrow: string;
  title: string;
  summary: string;
  operations: readonly string[];
}) {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-base leading-7 text-muted-foreground">{summary}</p>
      </div>
      <StatusNotice title="Not connected — requires server-side authorization">
        This page loads no data and offers no actions. Hiding or showing a link is not access control; these
        operations will only exist behind a server that checks each person&apos;s role.
      </StatusNotice>
      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground">Planned operations</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
          {operations.map((operation) => <li key={operation}>{operation}</li>)}
        </ul>
      </Card>
    </div>
  );
}
