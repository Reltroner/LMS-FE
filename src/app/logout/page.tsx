"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function LogoutPage() {
  const { logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    async function processLogout() {
      try {
        await logout();
      } catch (err) {
        console.error("Logout failed:", err);
        setError("Logout failed. Please try again or clear your browser data.");
      }
    }

    processLogout();
  }, [logout]);

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
        <h1 className="mb-4 text-2xl font-bold text-destructive">Logout Error</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="mt-4 text-muted-foreground font-medium">Logging out...</p>
    </div>
  );
}
