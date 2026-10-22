# Deterministic LMS Course Architecture Refactor

Completed implementation and available local verification: 2026-10-15 (Asia/Bangkok). Initial discovery and baseline: 2026-10-14.

## A — Baseline

Repository: `C:\Projects\lms-reltroner-studio`, origin `https://github.com/Reltroner/LMS-FE.git`. Branch: `main`. Initial and final HEAD: `623735d5d1890ea97e3dc5063c4ee6e7902a84b0`. No commit, push, merge, deployment, production configuration change or draft publication was performed.

Initial dirty files: `src/app/courses/page.tsx`, `src/app/mentorship/page.tsx`, `src/app/paths/page.tsx`, `src/app/search/page.tsx`, `src/components/layout/Header.tsx`. Initial untracked file: `project-architecture.txt`. Their initial worktree bytes are preserved, verified against captured SHA256 values.

The checkout was the prototype architecture, not the MDX-enabled branch. App routes consumed course/lesson/body/resource/path fixtures; MDX was not compiled. Course modules and a separate lesson map duplicated ordering. Draft fixture modules referenced synthetic lessons instead of the existing authoring curriculum. Only Backend Engineering and Full Stack Backend Engineer were publicly routed. Synthetic API Design Patterns and Deployment & Operations were excluded from public course lists/routes but remain in independent labeled learner simulations.

Dependencies: Next 16.4.0, React/React DOM 19.3.0, Node 22.23.1, npm 10.9.8. Existing dependency versions remain unchanged (comparison of the old/new lockfile reports zero existing package version changes). The compiler additions are development dependencies `@mdx-js/mdx` 3.1.1, `yaml` 2.9.1, an explicit declaration of the existing Zod 4.6.7 dependency, and `@types/mdx` 2.0.14. No Contentlayer dependency or config exists in this checkout. Stale ignored `.contentlayer/` output existed from earlier work.

Original source inventory: Backend Engineering has 3 published MDX lessons; Worldbuilding Operating System has 15 draft MDX lessons; In-World Living Lab has 13 draft MDX lessons. All 31 source files, author documents and supporting resources remain present. Draft course composition was recovered from the existing local `fix/windows-contentlayer-staging-lf-20261010` branch, whose module arrays match these sources (5 Worldbuilding modules and 3 Living Lab modules). This is not the proposed 89-lesson replacement curriculum.

Baseline results: six prototype tests PASS; TypeScript PASS; Next build PASS with 23 pages; selected-page export scanner PASS. Lint FAIL with two errors and three warnings in stale generated Contentlayer declarations. Additional baseline investigation found both private course titles and the private path title in `out/_next/static/chunks/3ssp89vuwiqgc.js`. The original scanner explicitly did not scan the whole browser bundle.

## B — Architecture Findings

The evidence/severity/ownership/remediation/risk audit is recorded in [COURSE_ARCHITECTURE.md](COURSE_ARCHITECTURE.md). The critical finding was private metadata bundled by client imports before runtime filtering. High findings were duplicate fixture metadata/prose, duplicate ordering with silent missing-lesson filtering, global lesson lookup collisions, malformed draft YAML, and unregistered real draft curricula. Missing source validation and full output checks were medium findings. Linting stale generated files was low. Historical identity, denylist and Studio contracts required preservation, not replacement.

The reference investigation read Skill-Wanderer's real `createCourse`, `createModule`, `createLesson`, central registry, course-local module imports and `useCourses` implementation. We reused local course ownership, deterministic composition and shared queries. We did not copy TypeScript-authored prose, default lesson duration, inherited publication status, Nuxt/Vue code or filtering after importing an entire authoring registry. Sources and the candidate curriculum distinction are linked in the decision record.

## C — Implemented Changes

The following are the exact maintained files changed or added by this refactor. The five pre-existing dirty UI files and `project-architecture.txt` are excluded from this list because this work did not edit them.

| Files | Responsibility / reason |
| --- | --- |
| `src/catalog/courses/backend-engineering/course.ts`; `src/catalog/courses/worldbuilding-operating-system/course.ts`; `src/catalog/courses/in-world-living-lab/course.ts` | Canonical course definitions, planned estimates, prerequisites and ordered module membership; real draft composition replaces unconnected synthetic modules |
| `src/catalog/courses/backend-engineering/resources.ts`; `src/catalog/courses/worldbuilding-operating-system/resources.ts`; `src/catalog/courses/in-world-living-lab/resources.ts`; `src/catalog/resources/jsdelivr.ts` | Course-local resource details; retain existing external URLs and prior MDX branch's download locations |
| `src/catalog/courses/index.ts` | One explicit authoring registration per course/resource collection; build-only |
| `src/catalog/courses/public.ts`; `src/catalog/paths/public.ts` | Explicit publication allowlists; independent policy, not duplicate metadata |
| `src/catalog/paths/index.ts` | Canonical path composition; course path membership derives from this owner |
| `src/lib/content/validators.ts` | Shared Zod contracts, enums, durations, required arrays, resource URLs, identities and uniqueness diagnostics |
| `src/lib/content/compiler.ts` | Validated composition; source/resource ownership; prerequisites; MDX compilation; publication filtering; no fallback lesson data |
| `src/lib/content/filters.ts` | Shared status + allowlist + denylist eligibility |
| `src/lib/content/queries.ts`; `src/lib/content/course-registry.ts` | Shared public-only course-aware lookup, counts/duration, navigation and route parameters |
| `src/lib/content/mdx.tsx` | Server-only compiled body access and reusable existing block rendering |
| `src/lib/routes/route-builders.ts` | Canonical lesson route construction for identity checks |
| `src/types/lesson-content.ts`; `src/types/course.ts` | Existing block contract relocated; `download`/source filename support restored for real private resources |
| `src/lib/fixtures/courses.ts`; `src/lib/fixtures/lessons.ts`; `src/lib/fixtures/resources.ts`; `src/lib/fixtures/paths.ts`; `src/lib/fixtures/lesson-content.ts` | Compatibility re-exports/types only; remove proven duplicate runtime metadata, body arrays and course-specific lesson map |
| `src/components/course/CourseCurriculum.tsx` | One query call now supplies the owning course; all markup, styles and accordion handlers remain unchanged |
| `src/components/lesson/LessonContent.tsx` | Accept compiled MDX children in the unchanged prose wrapper; preserve existing block renderer and classes |
| `src/app/courses/[slug]/page.tsx` | Shared public route parameters, including the existing declared course alias; no presentation changes |
| `src/app/courses/[slug]/lessons/[lesson]/page.tsx` | Course-aware lookup, shared navigation, compiled MDX input and alias route enumeration; no style changes |
| `content/courses/backend-engineering/lessons/01-http-overview.mdx`; `content/courses/backend-engineering/lessons/02-http-methods.mdx` | Transfer existing lesson resource IDs to authoritative frontmatter; body prose untouched |
| `content/courses/worldbuilding-operating-system/lessons/00-course-orientation.mdx` | Repair YAML keys and Markdown-style `*` list markers to valid YAML sequences; all wording/body retained |
| `contracts/catalog/lesson-id-additions.json` | Empty append-only extension for future lessons; historical registry untouched |
| `scripts/catalog-inputs.ts`; `scripts/prepare-public-content.ts` | One compiler entry point for validation and public-only staging; no runtime filesystem in client components |
| `scripts/verify-public-output.ts` | Actual recursive artifact scan for restricted metadata, stable IDs, routes, body snippets and unauthorized generated routes |
| `scripts/capture-course-baseline.mjs`; `scripts/verify-course-ui.mjs` | Original export/source evidence and structural regression comparisons, including resolved Suspense output |
| `tests/course-architecture.test.mjs`; `tests/prototype-contract.test.mjs` | Behavioral positive/negative coverage; retain six prototype obligations while replacing brittle fixture-string assertions with actual compiled query checks |
| `package.json`; `package-lock.json`; `tsconfig.json` | Necessary compiler dependencies; preparation before dev/build/typecheck; scanner after build; Node's existing TypeScript stripping capability; generated stale output excluded from typecheck |
| `eslint.config.mjs`; `.gitignore` | Ignore compiler-owned output/evidence; prohibit presentation authoring-catalog imports without disabling source lint rules |
| `.github/workflows/phase3b-fe-privacy-ci.yml` | Install locked dependencies before tests; run source validation/typecheck/lint, build and full privacy scanner in CI |
| `README.md`; `COURSE_ARCHITECTURE.md`; `COURSE_REFACTOR_REPORT.md` | Architecture audit/decision, bounded authoring workflow, separate publication and verification evidence |

No generated artifact is maintained or manually patched. `.public-content/`, `.next/`, `out/`, stale `.contentlayer/`, source baseline snapshots and temporary comparison evidence are ignored. No CSS/Tailwind configuration, breakpoint, theme, layout or animation edits were made.

## D — Before vs After

| Concern | Before | After |
| --- | --- | --- |
| Course registration | Monolithic fixture array with real and synthetic entries | Course-local definitions, one build-only authoring registration |
| Module composition | Course modules plus independent hardcoded course-to-lesson map | Ordered module membership is authoritative; uniqueness/missing references fail |
| Lesson loading | Global slug lookup; manually copied frontmatter | Validated frontmatter; composite course/slug query; frozen registry IDs |
| MDX processing | No active compiler; separate fixture body blocks | Maintained MDX compiler; public-only normalized staging and server-rendered modules |
| Resources | Fixture metadata; lesson associations duplicated outside MDX | Course-local definitions and MDX resource IDs; source/ID/ownership checks |
| Publication | Runtime filters after client fixture imports | Explicit allowlists + published statuses + historical denylist before generating importable data |
| Routes | Canonical static params; declared alias not exported | Same canonical URLs and generic queries; existing alias now exported for course and three lessons |
| New course | Add fixture metadata, map, body data and sources manually | Add definition, MDX, optional resources, identity extension and one authoring registration |
| Paths/duration/counts | Both course and path store membership; lesson map determines counts | Paths own membership; duration/counts/navigation derive from eligible module order |

Public aliases now include `/courses/backend-engineering-fundamentals` and its three existing lesson slugs. The canonical routes remain unchanged. Public metadata now uses historical `lms-lesson-0001`–`0003`, rather than prototype-only `lesson-be-*` React keys; consumer analysis found no persisted/learner-state dependency on the former fixture IDs. The frozen 31 historical identities remain byte-identical (SHA256 `644c0e353cd95febcdde0a4d4f2d293fce6efc71084082ab99467a0cb7376579`).

Course `estimatedHours` remains the planned curriculum estimate to preserve presentation semantics; actual lesson duration is derived (Backend Engineering: 60 minutes). Existing standalone mock enrollment totals/assistant responses are independent labeled simulations, not canonical authoring data.

## E — Course Onboarding Proof

`npm test` executes `draft onboarding extends beyond 31 identities without changing public output or UI`. It copies canonical source content into an isolated temporary directory, keeps the historical registry unchanged, writes and imports a real temporary `src/catalog/courses/example-course/course.ts` and explicit `src/catalog/courses/index.ts` registration, authors 36 MDX lessons, and writes/reads an identity extension JSON with 36 new records. It validates 67 lessons and compares before/after public data for deep equality. No example-course source or body appears in public staging. No UI files exist or are edited in the isolated course workspace. Temporary directories are removed after the test with checked paths.

The exact persistent developer steps are documented in [COURSE_ARCHITECTURE.md](COURSE_ARCHITECTURE.md): create content/definition, author frontmatter, append identities, register course and optional resources, validate/test/build, then confirm absence from public output. Keep new courses out of allowlists. Publication is a separately authorized workflow. Existing lesson kinds represent assignments as labs and quizzes as checkpoints; no unrelated assessment engine was added.

## F — UI/UX Preservation

Compared original and final exports for `/`, `/courses`, `/courses/backend-engineering`, all three canonical Backend Engineering lesson pages, `/paths`, `/paths/full-stack-backend-engineer`, `/search`, and `/my-learning`. The comparator includes both the initial loading shell and later resolved Suspense content. Element/class/interaction-attribute sequences outside permitted editorial regions match. Header/footer markup matches exactly. All five pre-existing UI edits remain byte-identical. The check reports 72 original captured files byte-identical; the three known frontmatter changes are separately accounted for. A separate source comparison confirms all 31 MDX bodies are unchanged.

Expected editorial differences: public lesson bodies now render their original MDX instead of the prototype's divergent extra prose, examples/callouts/checkpoints. HTTP Methods uses its canonical summary, objectives (3 rather than fixture 2), outputs (2 rather than fixture 1), and tags. Body height/text naturally differs; this is not asserted to be pixel-identical. The objective/output repeated row markup and classes remain identical. Existing resource links and previous/next URLs are retained.

Tested viewport/theme conditions: **none through a live browser**. `cua.createBrowserTab("chrome", ...)` reported the browser unavailable; `cua.getState()` returned `apps: []`, `browsers: []`. Therefore desktop/mobile screenshots, actual accordion clicks, responsive navigation, search keyboard interactions and light/dark rendering are **NOT RUN**. No visual or live-interaction parity is claimed. Existing event handlers/styles are unchanged and structural evidence passes, but the browser acceptance gate remains unverified.

## G — Test Results

All commands below were actually run locally; remote CI itself has not been triggered.

| Command / check | Result | Evidence | Notes |
| --- | --- | --- | --- |
| Baseline `node --test tests/prototype-contract.test.mjs` | PASS | 6/6 tests | Before edits |
| Baseline `npx tsc --noEmit` | PASS | Exit 0 | Before edits |
| Baseline `npm run lint` | FAIL | 2 errors, 3 warnings in stale `.contentlayer/generated` | Corrected generated-output boundary; no rule suppression |
| Baseline `npm run build` | PASS | 23 static pages | Before edits |
| Baseline `node scripts/verify-prototype-export.mjs` | PASS | Selected HTML/public-route scope | Did not certify bundles |
| Baseline whole-bundle title inspection | FAIL | One JS chunk contained both draft course titles and draft path title | Pre-existing privacy defect fixed |
| `npm test` | PASS | 41 tests, 0 failures | Composite keys; statuses/allowlists/denylist; IDs; malformed/missing metadata; references; ordering/navigation; extensibility; actual scanner negatives; 6 prototype obligations |
| `npm run typecheck` | PASS | Preparation validates 3 courses/31 lessons; `tsc --noEmit` exit 0 | Includes generated public React imports |
| `npm run lint` | PASS | Exit 0, no source warnings/errors | Generated artifacts ignored; authoring imports restricted |
| `npm run validate:content` | PASS | 3 courses, 31 MDX lessons; public 1 course/3 lessons/1 path | Shared strict validator |
| `npm run validate:resources` | PASS | Same full graph validated, 29 resource definitions resolve | Alias intentionally uses the same compiler; no second parser |
| `npm run check:orphans` | PASS | All 31 lessons have module/identity ownership; resource files have definitions | Author docs and resource README remain legitimate supporting files |
| Final `npm run build` | PASS | 27 static pages, including 4 existing-alias pages; postbuild scanner PASS | Next/React/export config unchanged |
| `npm run verify:public` (also postbuild) | PASS | 195 assets; 423 restricted markers; 14 required routes | Scans HTML, JS, JSON, XML, text and all other exported asset files; no restricted routes or metadata found |
| Final `node scripts/verify-prototype-export.mjs` | PASS | `PROTOTYPE_STATIC_EXPORT_SCOPE = PASS` | Original limited scanner retained; full scan is separate and stronger |
| `npm run verify:ui` | PASS (structural) | 10 exported-page comparisons, 72 original files byte-identical | Exact declared canonical-content exceptions; no pixel-parity claim |
| Existing dependency preservation check | PASS | Existing dependency version changes: `[]` | No upgrades |
| Original MDX body comparison | PASS | Original MDX bodies changed: `[]` | YAML/resource frontmatter corrections only |
| `git diff --check` | PASS | Exit 0 | Git notes future LF/CRLF checkout conversion; no whitespace errors |
| `git status --short`; `git diff --stat` | PASS (reviewed) | Only intended maintained files plus preserved original dirty/untracked work | Generated/cache/export directories are ignored |
| Browser screenshots and live interactions | NOT RUN | No browser/app surfaces in the session | Remaining acceptance gap |
| Historical Phase 3B 19-test Contentlayer suite | NOT RUN | Absent from this prototype checkout | Not fabricated/restored; new behavioral privacy coverage does not claim execution of absent tests |

The Node TypeScript runner emits an existing-format ESM detection warning because the package does not globally declare `type: module`; this is informational and all commands exit successfully. The change deliberately avoids altering module semantics project-wide merely to suppress that warning.

## H — Remaining Risks

| Severity | Impact / scope | Evidence | Recommended remediation |
| --- | --- | --- | --- |
| MEDIUM: unverified live UI acceptance | Responsive behavior, themes and interactions have structural/source evidence but no executed browser comparison | No apps/browsers exposed; no viewport screenshots | In a browser-enabled session compare desktop/mobile light/dark course, lesson, path, search and learner routes; click accordion/mobile navigation and test previous/next and keyboard search |
| LOW: canonical-content differences | Lesson-body text/height and HTTP Methods metadata differ from the prototype copy | Original MDX bodies untouched; explicit comparison exceptions | Review canonical course prose editorially if future changes are desired; retain one authoritative MDX owner |
| LOW: authoring preview workflow | A running dev server needs public data regenerated after authoring edits | Preparation runs at startup and via explicit script, not a filesystem watcher | Run `npm run prepare:content` or restart dev; add a watcher only if demonstrated authoring needs justify it |
| LOW: future identity renames/extended components | Renames and unsupported executable MDX deliberately fail | Explicit diagnostics and tests | Make separately reviewed migration/alias or reusable-renderer contract changes when actually needed |

No known failing implementation, type, lint, source-validation, identity or public-output gate remains. Existing mocked OIDC/backend/learner/admin/assistant features, synthetic learner progress and prototype-only links remain outside this course architecture refactor. Studio attestation and denylist files are unchanged. This report does not certify production authentication, source rights or live learner functionality.

## I — Final Engineering Verdict

**PARTIAL**

The refactor and all available source, behavioral, build, identity, privacy and structural checks are complete and passing. Full acceptance is withheld because live UI/browser verification across viewports/themes and interactions could not be executed. No draft course was published and no original MDX body or historical identity was lost. The result has no known unnecessary parallel registry, duplicated canonical lesson metadata or unresolved implementation regression within the verified scope; it is not a claim of zero technical debt.
