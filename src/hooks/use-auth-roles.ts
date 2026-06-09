import { useMemo } from "react";
import { useAuth } from "./use-auth";
import { type AuthRole, extractRoles } from "@/lib/auth/auth-roles";

export function useAuthRoles() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const roles = useMemo(() => {
    if (!isAuthenticated || !user) {
      return [];
    }
    return extractRoles(user);
  }, [isAuthenticated, user]);

  const isAdmin = roles.includes("admin");
  const isInstructor = roles.includes("instructor");
  const isStudent = roles.includes("student");

  let highestRole: AuthRole | null = null;
  if (isAdmin) highestRole = "admin";
  else if (isInstructor) highestRole = "instructor";
  else if (isStudent) highestRole = "student";

  const hasRole = (role: AuthRole) => roles.includes(role);
  const hasAnyRole = (allowedRoles: AuthRole[]) => allowedRoles.some((r) => roles.includes(r));

  return {
    roles,
    highestRole,
    isAdmin,
    isInstructor,
    isStudent,
    hasRole,
    hasAnyRole,
    isLoading,
    isAuthenticated,
  };
}
