import { Badge } from "@/components/ui/Badge";
import { Heading } from "@/components/ui/Heading";
import { PrincipalManagement } from "@/components/admin/PrincipalManagement";

export const metadata = { title: "Principals" };

export default function PrincipalsPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <Badge tone="accent">Identity-managed principals</Badge>
          <Heading level={1} className="mt-2">Principal Management</Heading>
          <p className="mt-1 text-sm text-muted-foreground">
            List, view, and prototype role changes. Identity lives in Keycloak.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <PrincipalManagement />
      </div>
    </>
  );
}
