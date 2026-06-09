# Reltroner Studio SSO Architecture Roadmap

## Keycloak → LMS Integration Design

**Version:** 1.0
**Status:** Architecture Approved
**Deployment State:** LMS Production Live
**Next Objective:** Integrate Authentication and Authorization

---

## Current State

### LMS

- **Production URL:** `https://lms.reltroner.com`
- **Deployment:** Cloudflare Pages, Static Export
- **Technology:** Next.js 16, React 19, TypeScript
- **Current authentication:** None

### Identity Provider

- **Keycloak URL:** `https://sso.skill-wanderer.com`
- **Realm:** `reltroner`
- **Client:** `lms-reltroner`
- **Protocol:** OpenID Connect
- **SMTP:** Hostinger Business Email
- **Theme:** `reltroner-theme`

---

## Target Architecture

### Phase 1

Authentication only. No RBAC yet.

```text
┌─────────────────────┐
│ LMS Frontend        │
│ lms.reltroner.com   │
└──────────┬──────────┘
           │
           │ OIDC PKCE
           │
           ▼
┌─────────────────────┐
│ Keycloak            │
│ Reltroner Realm     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ User Database       │
│ Keycloak Internal   │
└─────────────────────┘
```

---

## Authentication Flow

1. User visits `https://lms.reltroner.com` and tries to access a protected route (`/courses`, `/paths`, `/profile`, `/dashboard`).
2. Redirect to `https://sso.skill-wanderer.com`.
3. User login via Email/Password or Google.
4. Keycloak returns Authorization Code.
5. Frontend exchanges Code + PKCE for Access Token, ID Token, Refresh Token.
6. User redirected back to `https://lms.reltroner.com`.
7. Authenticated session established.

---

## Recommended Authorization Model

**Initial roles:** `student`, `instructor`, `admin`
**Stored inside:** Realm Roles (Not Client Roles)
**Reason:** Simpler, supports future multi-app SSO.

---

## User Journey

### Student

- Register
- Verify Email
- Login
- View Courses
- View Learning Paths
- Track Progress

### Instructor

- Create Courses
- Manage Lessons
- Manage Learning Paths

### Admin

- Manage Users
- Manage Roles
- Manage Content

---

## Keycloak Configuration Roadmap

### Realm

- Already created: `reltroner`

### Client

- Already created: `lms-reltroner`

### Update Client Configuration

- **Root URL:** `https://lms.reltroner.com`
- **Home URL:** `https://lms.reltroner.com`
- **Valid Redirect URIs:** `https://lms.reltroner.com/*`
- **Valid Logout URIs:** `https://lms.reltroner.com/*`
- **Web Origins:** `https://lms.reltroner.com`
- **PKCE:** S256 (Mandatory)

---

## Google Login

- **Identity Provider:** Google
- **Realm:** `reltroner`
- **Flow:** Google OAuth → Keycloak → LMS
- **Never:** Google directly to LMS
- **Always:** Google → Keycloak → Application

---

## Frontend Authentication Strategy

- **Recommended library:** `oidc-client-ts`
- **Alternative:** `react-oidc-context`
- **Avoid:** `keycloak-js`
- **Reason:** Modern OIDC ecosystem, better PKCE support, vendor-neutral.

---

## Session Storage

- **Recommended:** Memory Storage
- **Access Token:** Memory
- **Refresh Token:** HttpOnly Cookie (Future enhancement)
- **For MVP:** `sessionStorage` acceptable.

---

## Route Protection Strategy

- **Public:** `/`, `/about`, `/contact`, `/search`
- **Protected:** `/learn`, `/courses`, `/dashboard`, `/profile`
- **Admin:** `/admin`
- **Instructor:** `/instructor`

---

## Future Ecosystem Vision

SSO becomes the central identity platform.

```text
                Keycloak
                    │
      ┌─────────────┼─────────────┐
      │             │             │
      ▼             ▼             ▼

 LMS         Client Portal     Community

      ▼             ▼             ▼

 ERP          HRM          Future Apps
```

**Single Sign-On:** One Account, Many Applications

---

## Phase Execution Order

### Phase A: Authentication MVP

**Goal:** Login, Logout, Register, Email Verification

### Phase B: Role-Based Access Control

**Goal:** `student`, `instructor`, `admin`

### Phase C: Google Login

**Goal:** Login with Google

### Phase D: Profile Management

**Goal:** Account Settings, Change Password, Profile Update

### Phase E: Cross Application SSO

**Goal:** LMS, ERP, HRM, Community, Client Portal all sharing Reltroner Identity.

---

## Final Target State

```text
User
  │
  ▼
lms.reltroner.com
  │
  ▼
sso.skill-wanderer.com/realms/reltroner
  │
  ▼
Keycloak Authentication
  │
  ▼
OIDC Token
  │
  ▼
Protected LMS Experience
```

**Architecture Status:** Ready for Implementation
