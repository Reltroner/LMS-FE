"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

function AuthReturnLogic() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // 1. Read query parameter ?to=/courses
    const rawTo = searchParams.get("to");
    let targetPath = "/courses"; // Default

    // 2. Sanitize target: only allow internal paths beginning with "/"
    // Reject anything like "http...", "//", "javascript:", etc.
    if (rawTo && rawTo.startsWith("/") && !rawTo.startsWith("//")) {
      targetPath = rawTo;
    }

    if (isAuthenticated) {
      // 3. If authenticated, route to the target path
      router.replace(targetPath);
    } else {
      // 4. If unauthenticated, store the return path and login
      sessionStorage.setItem("lms_return_path", targetPath);
      login().catch((err) => {
        console.error("Failed to redirect to login from /auth/return:", err);
      });
    }
  }, [isLoading, isAuthenticated, router, searchParams, login]);

  // If auth is loading, show minimal state
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="mt-4 font-medium text-muted-foreground">Restoring your Reltroner session...</p>
    </div>
  );
}

export default function AuthReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 font-medium text-muted-foreground">
            Restoring your Reltroner session...
          </p>
        </div>
      }
    >
      <AuthReturnLogic />
    </Suspense>
  );
}
