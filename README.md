# Reltroner Learning Academy

Frontend-only static LMS shell for `lms.reltroner.com`.

This repository is the LMS application and MDX content engine. It does not store heavy learning media and it does not include backend runtime features.

## Architecture

- Next.js 16 App Router
- Static export only with `output: "export"`
- Contentlayer-powered MDX lessons
- TypeScript catalog data for courses, paths, authors, and resources
- Client-side static search
- No backend, auth, API routes, SSR, middleware, database, server session, or runtime request dependency

## Content Convention

Lessons live under:

```text
content/courses/<course-slug>/lessons/<lesson-slug>.mdx
```

Lesson frontmatter contains lesson metadata only. Course slug, lesson slug, module placement, and order are derived from the folder path and `src/catalog`.

Course resources and author notes can live beside lessons as lightweight markdown:

```text
content/courses/<course-slug>/resources/
content/courses/<course-slug>/author/
```

## Catalog Convention

Typed course and path metadata lives in `src/catalog`.

- `src/catalog/courses/*/course.ts` defines course modules and ordered `lessonSlugs`.
- `src/catalog/courses/*/resources.ts` defines resource manifests.
- `src/catalog/paths/*.ts` defines learning paths.
- `src/lib/content/*` exposes registries used by routes and components.

## Resource Convention

Heavy resources such as video, audio, large images, and PDFs belong in the external asset repository:

```text
reltroner/reltroner-lms-assets
```

The LMS references those assets through pinned jsDelivr URLs, currently based on:

```text
https://cdn.jsdelivr.net/gh/reltroner/reltroner-lms-assets@v0.1.0
```

Use resource ids in MDX instead of hardcoding media URLs whenever possible.

## Local Development

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run typecheck
npm run lint
npm run validate:content
npm run validate:resources
npm run check:orphans
npm run build
```

Format files:

```bash
npm run format
```

## Static Deployment

Cloudflare Pages:

- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `out`

Generated folders such as `.next`, `out`, `.contentlayer`, and `node_modules` are ignored and should not be committed.
