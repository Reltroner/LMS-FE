import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleGate } from "@/components/auth/RoleGate";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Admin Console",
  description: "Frontend role-aware admin entry point.",
  path: "/admin",
});

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <RoleGate
        allowedRoles={["admin"]}
        fallback={
          <Section className="py-20">
            <Container>
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-3xl font-bold text-foreground">Access Limited</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  This page is visible only to admin-role users in the frontend UI.
                </p>
              </div>
            </Container>
          </Section>
        }
      >
        <Section className="py-20">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-3xl font-bold text-foreground">Admin Console</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Frontend role-aware admin entry point.
              </p>
              <div className="mt-10 rounded-2xl bg-red-50 p-8 text-left ring-1 ring-red-100 dark:bg-red-950/20 dark:ring-red-900/30">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Reminder: This is a frontend UX gate only. Real admin capabilities must be
                  protected by a backend API or server-side authorization layer.
                </p>
              </div>
            </div>
          </Container>
        </Section>
      </RoleGate>
    </ProtectedRoute>
  );
}
