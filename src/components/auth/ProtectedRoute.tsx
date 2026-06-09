"use client";

import { useAuth } from "@/hooks/use-auth";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, login } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Optional: Save return path
  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated && pathname) {
      sessionStorage.setItem("lms_return_path", pathname);
    }
  }, [mounted, isLoading, isAuthenticated, pathname]);

  // Prevent hydration mismatch by returning early if not mounted
  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 font-medium text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Section className="py-16 sm:py-24">
        <Container>
          <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-[2rem] border border-border bg-card p-8 text-center shadow-[0_24px_70px_-56px_rgba(15,23,42,0.28)]">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <Heading level={2} className="mb-3 text-2xl font-semibold">
              Sign in required
            </Heading>
            <p className="mb-8 text-muted-foreground">
              Please log in to continue your learning experience. Your session is managed by
              Reltroner Identity.
            </p>
            <button
              onClick={() => login()}
              className="w-full rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-[0_16px_34px_-24px_rgba(29,78,216,0.65)] transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Login
            </button>
          </div>
        </Container>
      </Section>
    );
  }

  return <>{children}</>;
}
