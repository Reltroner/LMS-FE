"use client";

import { useAuthRoles } from "@/hooks/use-auth-roles";
import type { AuthRole } from "@/lib/auth/auth-roles";
import { useEffect, useState } from "react";

export type RoleGateProps = {
  allowedRoles: AuthRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
  const { hasAnyRole, isLoading, isAuthenticated } = useAuthRoles();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (!hasAnyRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
