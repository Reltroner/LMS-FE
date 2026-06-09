import type { AuthUser } from "@/lib/auth/auth-types";

export type AuthRole = "student" | "instructor" | "admin";

export const KNOWN_ROLES: AuthRole[] = ["student", "instructor", "admin"];

/**
 * Extracts Keycloak realm roles from the OIDC user object.
 *
 * Tries `rawProfile.realm_access.roles`, `rawProfile.roles`.
 * Safely ignores unknown Keycloak defaults like `offline_access`.
 * If an authenticated user has no matching known roles, defaults to `["student"]`.
 */
export function extractRoles(user: AuthUser | null | undefined): AuthRole[] {
  if (!user) return [];

  const rawRoles = new Set<string>();

  // 1. Check realm_access.roles in OIDC profile (ID token claims)
  const realmAccess = user.rawProfile?.realm_access as { roles?: string[] } | undefined;
  if (Array.isArray(realmAccess?.roles)) {
    realmAccess.roles.forEach((r) => rawRoles.add(r));
  }

  // 2. Check direct roles in OIDC profile
  const directRoles = user.rawProfile?.roles;
  if (Array.isArray(directRoles)) {
    directRoles.forEach((r) => rawRoles.add(r as string));
  }

  // Note: we removed access_token decoding fallback because access_token is not stored in AuthUser state.
  // The Keycloak configuration must include realm roles in the ID token (via client scopes/mappers).

  // Filter only recognized LMS roles
  const extractedRoles = Array.from(rawRoles).filter((r): r is AuthRole =>
    KNOWN_ROLES.includes(r as AuthRole),
  );

  // Default fallback: if authenticated but no explicit role is found, treat as student.
  if (extractedRoles.length === 0) {
    return ["student"];
  }

  return extractedRoles;
}
