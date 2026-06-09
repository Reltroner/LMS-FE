import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleGate } from "@/components/auth/RoleGate";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Instructor Workspace",
  description: "Frontend role-aware instructor entry point.",
  path: "/instructor",
});

export default function InstructorPage() {
  return (
    <ProtectedRoute>
      <RoleGate
        allowedRoles={["instructor", "admin"]}
        fallback={
          <Section className="py-20">
            <Container>
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-3xl font-bold text-foreground">Access Limited</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  This page is visible only to instructor-role users in the frontend UI.
                </p>
              </div>
            </Container>
          </Section>
        }
      >
        <Section className="py-20">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-3xl font-bold text-foreground">Instructor Workspace</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Frontend role-aware instructor entry point.
              </p>
              <div className="mt-10 rounded-2xl bg-amber-50 p-8 text-left ring-1 ring-amber-100 dark:bg-amber-950/20 dark:ring-amber-900/30">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Reminder: This is a frontend UX gate only. Real instructor capabilities must be
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
