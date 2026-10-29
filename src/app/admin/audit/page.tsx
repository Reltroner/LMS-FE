import { AdminCapabilityPage } from "@/components/admin/AdminCapabilityPage";

export const metadata = { title: "Audit" };

export default function AuditPage() {
  return (
    <AdminCapabilityPage eyebrow="Audit" title="Accountable changes"
      summary="An audit trail is only meaningful when a server writes it. Nothing is logged or displayed here."
      operations={[
        "Read who changed what, when, and through which service.",
        "Filter by person, action, or result.",
        "Keep audit data out of public search and the AI Guide.",
      ]} />
  );
}
