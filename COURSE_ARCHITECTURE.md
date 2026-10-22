# Course-as-Code decision (2026-10-14)

## Context and audit

Local `Reltroner/LMS-FE`, `main`, `623735d5d1890ea97e3dc5063c4ee6e7902a84b0` is the static Next.js prototype, not the MDX-enabled branch. Next 16.4.0 / React 19.3.0 / Node 22.23.1 remain unchanged. Five existing presentation edits and `project-architecture.txt` belong to the developer and are preserved.

| Severity / finding | Current ownership | Problem | Evidence | Remediation | Risk |
| --- | --- | --- | --- | --- | --- |
| CRITICAL: private metadata in browser bundles | Fixture imports in client curriculum/search | Filtering after importing does not remove draft metadata | Baseline `out/_next/static/chunks/3ssp89vuwiqgc.js` contains both private course titles and private path title | Compile only explicitly allowlisted, published content; scan every exported asset | Fail builds on exposure |
| HIGH: MDX is disconnected | `src/lib/fixtures/lessons.ts`, `lesson-content.ts` and 31 MDX files | Metadata and prose require manual synchronization | HTTP Methods frontmatter differs from fixture objectives/body; no Contentlayer config/dependency exists | MDX frontmatter/body becomes authoritative; retain presentation renderer | Canonical prose causes documented editorial differences |
| HIGH: ordering and ownership duplicated | Course modules plus hardcoded map in `fixtures/lessons.ts` | Missing lessons silently disappear | `.find(...).filter(Boolean)` and per-course map | Resolve registered module arrays once, fail on missing/duplicate membership | Diagnostics become stricter |
| HIGH: global lesson slug lookup | `getLessonBySlug(slug)` | Two orientation lessons already share a slug in MDX | Both draft courses contain `00-course-orientation.mdx` | Course-aware lookup and navigation | Minimal data-call changes in two presentation files |
| HIGH: invalid authoring metadata | Worldbuilding orientation frontmatter | YAML outputs/tags are indented into an objectives sequence | `00-course-orientation.mdx` | Repair only YAML keys and sequence indentation, preserve all text | One necessary source correction |
| MEDIUM: private course composition is mocked | Draft fixture courses | Modules reference five nonexistent synthetic lessons; 28 real draft MDX lessons unregistered | Fixture module arrays versus filesystem | Reuse the local MDX branch's documented 5-module/3-module composition | Drafts stay private |
| MEDIUM: validator coverage missing | Prototype test and selected-page scanner | No source validation or complete asset scan | Six prototype tests; scanner explicitly disclaims JS coverage | Shared Zod validation, negative tests, full output scanner | No production certification implied |
| LOW: stale generated files linted | ESLint default ignores | Unused old Contentlayer output produces two baseline lint errors | `.contentlayer/generated/types.d.ts` | Ignore generated compiler output, never edit it | No source rule is disabled |
| NO CHANGE REQUIRED: identities/privacy contracts | `contracts/catalog/*.json` | Historical registry remains valuable; 31 is a frozen baseline, not capacity | All 31 registered source paths exist | Preserve files; additions are append-only in a separate identity extension | Renames require explicit migration |
| NO CHANGE REQUIRED: mock learner/admin/auth | Labeled prototype fixtures | Separate product simulation, not canonical course authoring | No live OIDC/backend in this checkout | Keep existing flows and labels | Real authentication remains out of scope |

Baseline: six prototype tests PASS; `npx tsc --noEmit` PASS; `npm run build` PASS (23 pages); selected HTML export scanner PASS; lint FAIL on two stale generated declarations. Full bundle inspection exposes private metadata before the refactor.

## Decision and ownership

`src/catalog/courses/<slug>/course.ts` owns course metadata and ordered module membership. MDX owns lesson metadata and body. Course-local `resources.ts` owns resource details. `src/catalog/paths` owns membership; course `pathSlugs` are derived. Historical identities remain in the unchanged version-1 registry; new entries belong to an append-only extension. Separate course/path allowlists own publication eligibility, in conjunction with status and the historical denylist.

Authoring definitions + MDX → shared validation and MDX compilation → explicit publication filtering → public-only staging/compiler output → shared queries → existing routes/components.

There is no active Contentlayer pipeline to preserve in this checkout. Use the maintained MDX compiler with YAML frontmatter and the already-present Zod validation ecosystem, instead of restoring an obsolete Contentlayer/Next integration. Compiler, YAML parser and schemas run only during preparation. Generated React modules render on the server; browser-safe metadata contains only approved public entries. Never import authoring catalog modules in app/component code. No runtime filesystem loader, per-course adapter, additional UI registry, or automatic publication is introduced.

Course estimates (`estimatedHours`) describe the planned curriculum and retain the existing presentation contract. Actual duration/counts derive from eligible lessons. Empty optional resources are legitimate; missing registered content/resources are errors. Module and lesson array order is authoritative, independent of directory enumeration.

## Reference principles

The [Skill-Wanderer registry](https://github.com/skill-wanderer/LMS-FE/blob/main/app/data/courses/index.ts), [course composition](https://github.com/skill-wanderer/LMS-FE/blob/main/app/data/core/course.ts), [module ordering](https://github.com/skill-wanderer/LMS-FE/blob/main/app/data/core/module.ts), and [queries](https://github.com/skill-wanderer/LMS-FE/blob/main/app/composables/useCourses.ts) demonstrate local course ownership and generic consumers. We adopt those principles. We retain MDX instead of TypeScript-authored prose and reject invalid required metadata instead of using default durations or inherited publication. Public filtering happens before generating importable data, not after bundling an authoring registry.

The [Worldbuilding curriculum proposal](https://github.com/Reltroner/progress-documentation/blob/main/worldbuilding-operating-system/README.md) remains a proposal. The 89 lessons, assignments and quizzes are not authored or published by this refactor.

## Compatibility and migration

1. Preserve all legacy identities and original MDX prose.
2. Replace duplicate runtime fixture data with public query re-exports; keep independent labeled learner/admin simulations.
3. Validate the three real courses and all 31 MDX lessons, including private drafts.
4. Generate only Backend Engineering and its path. Status alone never publishes a course/path.
5. Keep CSS, layout, breakpoints and interactions. Change only course-aware query calls and the lesson renderer's data input.
6. Protect routes, aliases, ordering and privacy with behavioral tests and actual artifact checks.

The prototype's extra lesson prose, code/callout/checkpoint fixtures are not copies of the MDX. Removing that obsolete body owner restores canonical source content, so lesson-body text/length changes are expected and must be reported. No existing MDX prose is replaced. Backend HTTP resource links transfer into MDX frontmatter so lesson resources remain connected.

## Authoring and publication

Publication requires separate owner approval and coordinated allowlist/denylist review. Studio source attestations remain independent and unchanged; this compiler does not assert redistribution or canon rights.

### Add a draft course

1. Create `content/courses/example-course/lessons/01-introduction.mdx` (and optional `author/` and `resources/` directories).
2. Create `src/catalog/courses/example-course/course.ts` exporting `course satisfies CourseDefinition`. Give it a unique ID/slug, explicit `status: "draft"`, valid category/level, planned `estimatedHours`, and ordered modules with `lessonSlugs: ["01-introduction"]`. Module arrays, not filenames, determine order. Do not add `pathSlugs`; membership derives from path definitions.
3. Author all required frontmatter: `title`, `summary`, `kind`, `status`, `level`, positive integer `durationMinutes`, and nonempty `objectives`, `outputs`, `tags` arrays. Optional `resourceIds` must belong to this course. Existing kinds are `lesson`, `lab`, `checkpoint`, `capstone`: author assignments as labs and quizzes as checkpoints; this refactor does not add a grading engine or quiz player.
4. Append an identity to `contracts/catalog/lesson-id-additions.json`, e.g. `{ "lesson_id": "lms-lesson-example-introduction", "source_path": "content/courses/example-course/lessons/01-introduction.mdx", "legacy_route": "/courses/example-course/lessons/01-introduction" }`. Choose and retain the ID explicitly. Do not edit the historical registry. A rename is a separate explicit migration and alias decision; the compiler deliberately rejects implicit renames.
5. Define optional course-local `resources.ts` (`resources satisfies readonly Resource[]`). Download resources need a `filename` matching an existing course-local file. Register `{ course, resources }` once in `src/catalog/courses/index.ts`; an empty resource array is valid. Add learning-path membership only in a path definition if needed. New standalone courses need no path definition.
6. Run `npm run validate:content`, `npm run validate:resources`, `npm run check:orphans`, `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`. Resource/orphan scripts intentionally call the same validator to prevent divergent parsing/policy. Build automatically prepares and scans its actual export.
7. Confirm the new course is absent from `.public-content/data.json`, staged lesson bodies and `out/`. Do not add it to either public allowlist. For a running dev server, rerun `npm run prepare:content` after content edits or restart dev; preparation runs before dev/build/typecheck.

No changes to components, routes, CSS or a second lesson map are needed. The isolated regression test performs these operations, adds 36 new draft MDX lessons to the real 31-lesson authoring baseline, validates 67 identities, and confirms byte-equivalent public data. Test directories are removed safely after execution.

### Publish separately

Obtain explicit owner authorization. Review source rights, Studio attestation obligations (when ingesting into Studio), statuses and prerequisites. Review course/path allowlists and the existing denylist together; no new public entry is inferred from the authoring registry. Public paths cannot reference private courses; public prerequisites must resolve publicly. Validate and inspect the generated export before any separately authorized deploy. Do not publish either existing Worldbuilding course under this refactor.

### MDX and generated-output boundaries

The maintained MDX compiler processes Markdown and static reusable JSX blocks. Use `<Callout tone="tip" text="..." />` or `<Checkpoint title="..." items="first item&#10;second item" />`. Unsupported components, imports/exports, spread props and executable expressions fail compilation instead of importing private content or requiring course-specific UI code. Registering a new reusable component is an explicit renderer contract change, independent of course authoring.

`.public-content/` holds normalized public-only MDX, compiled React modules, metadata JSON and a server-only body registry. It is ignored, recreated by preparation, and never edited manually. Browser metadata queries have no authoring imports or filesystem access. The existing fixture module names are thin compatibility re-exports so unaffected UI imports remain stable; they contain no course, lesson, path or resource data. Mock learner/admin/assistant fixtures retain their independent, visibly labeled prototype purpose.

### Verification limits

The local `npm run verify:ui` compares ten baseline exports (including resolved Suspense content), preserved element/attribute sequences and byte-identical header/footer output. It records the permitted canonical-content differences. It needs the original ignored `.course-baseline` captured before edits; CI does not invent a missing baseline. This session exposes no browser or native app surfaces, so screenshot, viewport, light/dark and live interaction comparisons are not claimed. The unchanged styling and interaction handlers plus export checks provide structural evidence only. See the report for remaining acceptance gaps.
