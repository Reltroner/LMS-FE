"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { handleCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    async function processCallback() {
      try {
        await handleCallback();

        const returnPath = sessionStorage.getItem("lms_return_path");
        if (returnPath) {
          sessionStorage.removeItem("lms_return_path");
          router.replace(returnPath);
        } else {
          router.replace("/");
        }
      } catch (err) {
        console.error("Auth callback failed:", err);
        setError("Failed to process authentication. Please try logging in again.");
      }
    }

    processCallback();
  }, [handleCallback, router]);

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
        <h1 className="mb-4 text-2xl font-bold text-destructive">Authentication Error</h1>
        <p className="mb-8 text-muted-foreground">{error}</p>
        <button
          onClick={() => router.replace("/")}
          className="rounded-full bg-primary px-6 py-2 text-primary-foreground font-semibold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="mt-4 text-muted-foreground font-medium">Completing sign in...</p>
    </div>
  );
}
