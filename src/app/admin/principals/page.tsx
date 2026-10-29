import { AdminCapabilityPage } from "@/components/admin/AdminCapabilityPage";

export const metadata = { title: "Principals" };

export default function PrincipalsPage() {
  return (
    <AdminCapabilityPage eyebrow="Principals" title="People and roles"
      summary="Identities and credentials belong to the identity service. This console would only read and request role changes through it, never store passwords."
      operations={[
        "List people with administrative or mentor roles.",
        "Request role changes, recorded in the audit trail.",
        "Suspend access, enforced by the identity service.",
      ]} />
  );
}
