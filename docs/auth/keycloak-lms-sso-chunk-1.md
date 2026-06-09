# Reltroner LMS SSO Integration - Chunk 1

This document outlines the implementation details and validation status for **Chunk 1** of the Reltroner Studio SSO roadmap, which establishes the OIDC PKCE Auth Foundation using Keycloak.

## What Chunk 1 Implements

- **OIDC Client Configuration**: Uses `oidc-client-ts` configured for the Authorization Code flow with PKCE (S256).
- **Auth Provider Foundation**: A client-side React context (`AuthProvider`) that manages authentication state (`isLoading`, `isAuthenticated`, `user`, etc.).
- **Login Action**: Redirects users to the Keycloak authentication page.
- **Logout Action**: Redirects users to the Keycloak logout page (`/logout` route).
- **Callback Handling**: A dedicated route (`/auth/callback`) to process the OIDC response from Keycloak.
- **Session Restoration**: Authenticated sessions are stored and restored from `sessionStorage`.
- **Basic Authenticated User State**: Exposes user claims (like email, name, preferredUsername) securely to the frontend.
- **Minimal Auth UI Wiring**: A login button and an authenticated user state with a logout button are integrated into the main `Navbar`.
- **Environment Variables Design**: Fully configurable via `NEXT_PUBLIC_*` variables suitable for a static frontend deployment.

## Chunk 1 Validation Status

- **Implementation**: 100% Complete
- **Build & Static Export Validated**: Yes (via `npm run build` static export).
- **Security Validated**: Yes (`.env.local` is gitignored, no secrets committed, tokens are not logged or exposed).
- **Browser Automation Validated**: Pending (Requires manual test as live Keycloak test credentials are not provisioned in the automated environment).

## What it Intentionally Does NOT Implement

- **Explicit Statement: Route protection is not implemented yet.** (middleware or client-side guards).
- **Explicit Statement: RBAC is not implemented yet.** (Role-Based Access Control).
- Distinguishing between students, instructors, or admins.
- Backend APIs or Database integration.
- HttpOnly cookie refresh token flow.
- Profile management, account settings, or password changes.
- Large UI redesigns or deep integrations into course structures.

## Required Environment Variables

### Local Development (`.env.local`)

```env
NEXT_PUBLIC_OIDC_AUTHORITY=https://sso.skill-wanderer.com/realms/reltroner
NEXT_PUBLIC_OIDC_CLIENT_ID=lms-reltroner
NEXT_PUBLIC_OIDC_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:3000
NEXT_PUBLIC_OIDC_SCOPE="openid profile email"
```

### Production Environment (Cloudflare Pages)

```env
NEXT_PUBLIC_OIDC_AUTHORITY=https://sso.skill-wanderer.com/realms/reltroner
NEXT_PUBLIC_OIDC_CLIENT_ID=lms-reltroner
NEXT_PUBLIC_OIDC_REDIRECT_URI=https://lms.reltroner.com/auth/callback
NEXT_PUBLIC_OIDC_POST_LOGOUT_REDIRECT_URI=https://lms.reltroner.com
NEXT_PUBLIC_OIDC_SCOPE="openid profile email"
```

> **Note:** Do NOT introduce any `CLIENT_SECRET` into the frontend environment.

## Keycloak GUI Settings To Verify

The Keycloak client (`lms-reltroner`) within the `reltroner` realm must be configured with the following GUI settings:

- **Client type**: OpenID Connect
- **Access type / Client authentication**: OFF / Public client
- **Standard flow**: Enabled
- **Direct access grants**: Optional / not required for LMS
- **Implicit flow**: Disabled
- **Service accounts**: Disabled
- **PKCE Code Challenge Method**: S256

**Allowed URLs:**

- **Root URL**: `https://lms.reltroner.com`
- **Home URL**: `https://lms.reltroner.com`
- **Valid Redirect URIs**:
  - `https://lms.reltroner.com/*`
  - `http://localhost:3000/*`
- **Valid Post Logout Redirect URIs**:
  - `https://lms.reltroner.com/*`
  - `http://localhost:3000/*`
- **Web Origins**:
  - `https://lms.reltroner.com`
  - `http://localhost:3000`

## Testing the Implementation

### Local Browser Test Checklist

1. Start dev server.
2. Open `http://localhost:3000`.
3. Click Login.
4. Confirm redirect to `https://sso.skill-wanderer.com`.
5. Login with a real Keycloak test user.
6. Confirm redirect back to `http://localhost:3000/auth/callback`.
7. Confirm app redirects to home page.
8. Confirm Navbar shows authenticated user state.
9. Open DevTools Application tab.
10. Confirm OIDC state is in `sessionStorage`, not `localStorage`.
11. Confirm no tokens are printed in console.
12. Click Logout.
13. Confirm Keycloak logout redirect occurs.
14. Confirm return to `http://localhost:3000`.
15. Confirm Navbar returns to Login state.

### Production Browser Test Checklist

1. Set Cloudflare Pages production env variables.
2. Deploy production build.
3. Open `https://lms.reltroner.com`.
4. Click Login.
5. Confirm redirect to Keycloak.
6. Login.
7. Confirm return to `https://lms.reltroner.com/auth/callback`.
8. Confirm user state appears.
9. Click Logout.
10. Confirm return to `https://lms.reltroner.com` unauthenticated.

## Known MVP Limitations

- **Session Storage**: Tokens are currently persisted using `sessionStorage`. This is sufficient for the MVP but means sessions will not persist across browser tabs or windows.

## Next Chunks Roadmap

- **Chunk 2**: Route Protection
- **Chunk 3**: RBAC
- **Chunk 4**: Google Login via Keycloak
- **Chunk 5**: Profile Management
- **Chunk 6**: Production Security Hardening
