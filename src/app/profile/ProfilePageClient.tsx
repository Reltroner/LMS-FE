"use client";

import { useAuth } from "@/hooks/use-auth";
import { useAuthRoles } from "@/hooks/use-auth-roles";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getAccountUrl } from "@/lib/auth/account-url";
import Link from "next/link";

export function ProfilePageClient() {
  const { user } = useAuth();
  const { highestRole } = useAuthRoles();
  const accountUrl = getAccountUrl();

  return (
    <ProtectedRoute>
      <Section className="py-20">
        <Container>
          <div className="mx-auto max-w-2xl">
            <h1 className="mb-8 text-center text-3xl font-bold text-foreground">
              Account Overview
            </h1>

            <div className="rounded-[2rem] border border-border bg-card p-8 shadow-[0_24px_70px_-56px_rgba(15,23,42,0.28)]">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {user?.name || "Not provided"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {user?.email || "Not provided"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Preferred Username</h3>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {user?.preferredUsername || "Not provided"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                  <p className="mt-1 text-lg font-semibold capitalize text-foreground">
                    {highestRole || "Student"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Identity Source</h3>
                  <div className="mt-2 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
                    Reltroner Identity
                  </div>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_16px_34px_-24px_rgba(29,78,216,0.65)] transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  Continue Learning
                </Link>
                <Link
                  href="/paths"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/30 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  View Learning Paths
                </Link>
              </div>
            </div>

            <div className="mt-12 text-center">
              <h2 className="text-xl font-bold text-foreground">Advanced Settings</h2>
              <p className="mt-4 text-sm text-muted-foreground/80">
                If you open Reltroner Identity, keep this LMS tab open. To return from Reltroner
                Identity, use the Reltroner LMS application link.
              </p>

              <div className="mt-6">
                <a
                  href={accountUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/30 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  Advanced Identity Settings
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </div>

              <p className="mt-6 text-xs text-muted-foreground">
                For the smoothest experience, sign out from the LMS using the Logout button in the
                LMS navbar.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </ProtectedRoute>
  );
}
