import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { compileCatalog } from "../src/lib/content/compiler.ts";
import { createCourseQueries } from "../src/lib/content/queries.ts";
import { catalogInputs } from "../scripts/catalog-inputs.ts";
import { validateSubscription } from "../src/lib/newsletter/schema.ts";
import { createSubscriptionClient } from "../src/lib/newsletter/client.ts";
import { newsletterIntegration } from "../src/lib/newsletter/config.ts";
import { ecosystemLinks, isActiveRoute, primaryNav, studioLinks } from "../src/lib/site/links.ts";
import { imageSlots, resolveSlot } from "../src/lib/media/image-slots.ts";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const listSource = (dir) => fs.readdirSync(path.join(root, dir), { recursive: true })
  .map((file) => path.join(dir, String(file))).filter((file) => /\.(tsx?|mjs)$/.test(file));

// Test-only hooks (as in lesson-media.test.mjs): transpile TSX and resolve the "@/" alias and
// extensionless relative imports the way the Next.js bundler does.
const srcUrl = pathToFileURL(path.join(root, "src") + path.sep);
registerHooks({
  resolve(specifier, context, nextResolve) {
    const base = specifier.startsWith("@/") ? new URL(specifier.slice(2), srcUrl)
      : specifier.startsWith(".") && context.parentURL?.startsWith(srcUrl.href) && !/\.[a-z]+$/.test(specifier)
        ? new URL(specifier, context.parentURL) : null;
    if (base) {
      const match = [".ts", ".tsx"].map((ext) => new URL(base.href + ext)).find((url) => fs.existsSync(url));
      if (match) return { url: match.href, shortCircuit: true };
    }
    // Next's root entry points (next/link, next/navigation) are CommonJS files without an exports map.
    if (/^next\/[a-z-]+$/.test(specifier)) return nextResolve(`${specifier}.js`, context);
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (!url.endsWith(".tsx")) return nextLoad(url, context);
    const { outputText } = ts.transpileModule(fs.readFileSync(new URL(url), "utf8"), {
      fileName: fileURLToPath(url),
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    });
    return { format: "module", source: outputText, shortCircuit: true };
  },
});
const render = (element) => ReactDOMServer.renderToStaticMarkup(element);
const h = React.createElement;
const { GlobalNewsletterSection } = await import("../src/components/newsletter/GlobalNewsletterSection.tsx");
const { ExternalLink } = await import("../src/components/ui/ExternalLink.tsx");
const { ConceptImage } = await import("../src/components/marketing/ConceptImage.tsx");
const { GroundedAnswer } = await import("../src/components/assistant/GroundedAnswer.tsx");
const { CourseCurriculum } = await import("../src/components/course/CourseCurriculum.tsx");
const { Footer } = await import("../src/components/layout/Footer.tsx");

const { publicData, withheldResources } = await compileCatalog(root, catalogInputs(root));
const queries = createCourseQueries(publicData);
const wos = queries.getCourseBySlug("worldbuilding-operating-system");
const wosLesson = "/courses/worldbuilding-operating-system/lessons/01-01-what-is-worldbuilding";

// ---------------------------------------------------------------------------------------------
// Global shell
// ---------------------------------------------------------------------------------------------

test("shell: one newsletter immediately above one footer, rendered only by the root layout", () => {
  const layout = read("src/app/layout.tsx");
  const order = ['<main id="main-content"', "<GlobalNewsletterSection />", "<Footer />", "<FloatingChatWidget />"]
    .map((marker) => layout.indexOf(marker));
  assert.ok(order.every((index, i) => index > 0 && (i === 0 || index > order[i - 1])), "main → newsletter → footer order");
  assert.equal(layout.split("<GlobalNewsletterSection />").length, 2, "newsletter rendered once");
  assert.equal(layout.split("<Footer />").length, 2, "footer rendered once");
  assert.match(layout, /href="#main-content"[\s\S]*Skip to content/);
  for (const file of [...listSource("src/app"), ...listSource("src/components")]) {
    if (file.endsWith(path.join("app", "layout.tsx"))) continue;
    const source = read(file);
    assert.doesNotMatch(source, /<GlobalNewsletterSection\b|<Footer\b/, `${file} must not render another newsletter or footer`);
  }
  assert.doesNotMatch(read("src/app/admin/layout.tsx"), /<main\b/, "no nested main landmark in admin");
});

test("navigation: canonical order, external Contact, Ecosystem is a disclosure not a route", () => {
  assert.deepEqual(primaryNav.map((item) => item.label), ["Home", "Courses", "Paths", "Search", "AI Guide", "About"]);
  assert.equal(studioLinks.contact, "https://www.reltroner.com/contact");
  assert.deepEqual(ecosystemLinks.map((link) => [link.label, link.href]), [
    ["Reltroner Studio", "https://www.reltroner.com/"],
    ["Reltroner Learning", "https://lms.reltroner.com/"],
  ]);
  assert.ok(!fs.existsSync(path.join(root, "src/app/ecosystem")), "Ecosystem has no page");
  assert.ok(!fs.existsSync(path.join(root, "src/app/contact")), "Contact has no duplicate local page");
  const header = read("src/components/layout/Header.tsx");
  assert.match(header, /<ExternalLink href=\{studioLinks\.contact\}/);
  assert.match(header, /<EcosystemMenu \/>/);
  assert.doesNotMatch(header, /href="\/admin|Admin/, "no public Admin demo link");
  assert.match(read("src/components/layout/EcosystemMenu.tsx"), /aria-expanded=\{open\}[\s\S]*aria-controls=/);
  const link = render(h(ExternalLink, { href: studioLinks.contact, className: "x" }, "Contact"));
  assert.match(link, /^<a href="https:\/\/www\.reltroner\.com\/contact" target="_blank" rel="noopener noreferrer" class="x">Contact<svg[^>]*aria-hidden="true"/);
  assert.match(link, /<span class="sr-only"> \(opens in a new tab\)<\/span><\/a>$/);
});

test("navigation: active route matching is exact for Home and prefix-based elsewhere", () => {
  assert.equal(isActiveRoute("/", "/"), true);
  assert.equal(isActiveRoute("/courses/", "/"), false);
  assert.equal(isActiveRoute("/courses/worldbuilding-operating-system/", "/courses/"), true);
  assert.equal(isActiveRoute("/courses", "/courses/"), true);
  assert.equal(isActiveRoute("/coursesx", "/courses/"), false);
  assert.equal(isActiveRoute(null, "/"), false);
});

test("footer: verified destinations only — no Terms, no admin, no dead resource links", () => {
  const html = render(h(Footer));
  for (const href of [studioLinks.home, studioLinks.contact, studioLinks.privacy, studioLinks.newsletterPreferences]) {
    assert.ok(html.includes(`href="${href}" target="_blank" rel="noopener noreferrer"`), href);
  }
  // Outside a Next build, Link drops the trailing slash that trailingSlash: true adds in the export.
  for (const href of ["/courses", "/paths", "/search", "/ai", "/about", "/mentorship"]) assert.match(html, new RegExp(`href="${href}/?"`), href);
  assert.doesNotMatch(html, /terms|\/admin|lms-api\.reltroner\.com/i);
  assert.match(html, /Systems thinking, worldbuilding methodology, and creative constraints/);
});

// ---------------------------------------------------------------------------------------------
// Global search palette, full search, and AI Guide share one engine
// ---------------------------------------------------------------------------------------------

test("search: palette and full Search use the one public retrieval engine; no shadow index", () => {
  const palette = read("src/components/search/GlobalSearchPalette.tsx");
  const searchPage = read("src/components/search/SearchPage.tsx");
  assert.match(palette, /import\("@\/lib\/knowledge\/public-index"\)/);
  assert.match(palette, /module\.retrievePublicKnowledge/);
  assert.match(searchPage, /from "@\/lib\/knowledge\/public-index"/);
  assert.match(searchPage, /retrievePublicKnowledge\(/);
  for (const source of [palette, searchPage]) {
    assert.doesNotMatch(source, /knowledge-index\.json|lib\/knowledge\/retrieve|sampleCorpus|fetch\(/, "no second index or engine");
  }
  const provider = read("src/components/search/SearchPaletteProvider.tsx");
  assert.equal(provider.match(/addEventListener\("keydown"/g)?.length, 1, "one global shortcut listener");
  assert.match(provider, /event\.ctrlKey \|\| event\.metaKey/);
  assert.match(provider, /event\.isComposing/);
  assert.match(provider, /isContentEditable/);
  assert.match(read("src/app/layout.tsx"), /<SearchPaletteProvider>/);
});

test("search: palette is an accessible modal combobox with focus return and bounded queries", () => {
  const palette = read("src/components/search/GlobalSearchPalette.tsx");
  for (const pattern of [/role="dialog"/, /aria-modal="true"/, /role="combobox"/, /aria-activedescendant=/, /role="listbox"/,
    /role="option"/, /aria-live="polite"/, /maxLength=\{MAX_SEARCH_QUERY_CHARS\}/, /event\.key === "Escape"/, /onClose\(true\)/]) {
    assert.match(palette, pattern);
  }
  assert.match(read("src/components/search/SearchPaletteProvider.tsx"), /restoreFocus && target\?\.isConnected/);
});

// ---------------------------------------------------------------------------------------------
// Catalog inventory, syllabus, and withheld resources
// ---------------------------------------------------------------------------------------------

test("catalog: public WOS syllabus is 89 planned lessons; only published lessons carry a route", () => {
  assert.deepEqual(wos.modules.map((m) => m.syllabus.length), [9, 10, 11, 11, 11, 12, 11, 14]);
  const routed = wos.modules.flatMap((m) => m.syllabus.filter((entry) => entry.lessonSlug));
  assert.deepEqual(routed, [{ number: "01.01", title: "What Is Worldbuilding?", lessonSlug: "01-01-what-is-worldbuilding" }]);
  assert.ok(routed.every((entry) => queries.getLessonBySlug(wos.slug, entry.lessonSlug)?.status === "published"));
  assert.ok(wos.modules.every((m) => !("directory" in m) && !("plannedLessons" in m)), "authoring layout stays private");
  const inventory = queries.getCourseInventory(wos.slug);
  assert.deepEqual({ ...inventory, firstLesson: inventory.firstLesson.slug },
    { moduleCount: 8, plannedLessonCount: 89, availableLessonCount: 1, firstLesson: "01-01-what-is-worldbuilding" });
});

test("catalog: CDN resources not pinned to an approved repository commit are withheld", async (t) => {
  assert.equal(withheldResources.length, 13, "unpublished v0.1 worksheet tag is withheld");
  assert.ok(withheldResources.every((r) => r.url.includes("reltroner-lms-assets@v0.1.0")));
  assert.deepEqual(publicData.resources, []);

  const base = fs.mkdtempSync(path.join(os.tmpdir(), "lms-resources-"));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  fs.cpSync(path.join(root, "content"), path.join(base, "content"), { recursive: true });
  const inputs = structuredClone(catalogInputs(root));
  const entry = inputs.catalog.find((e) => e.course.slug === "worldbuilding-operating-system");
  const pinned = `https://cdn.jsdelivr.net/gh/Reltroner/lms-reltroner-resource@${"a".repeat(40)}/courses/wos/observation-sheet.md`;
  entry.resources.push({ id: "wos-observation-sheet", courseSlug: entry.course.slug, type: "download",
    title: "Observation Sheet", summary: "A pinned worksheet.", url: pinned, filename: "observation-sheet.md" });
  fs.writeFileSync(path.join(base, "content/courses/worldbuilding-operating-system/resources/observation-sheet.md"), "# Observation sheet\n");
  const compiled = await compileCatalog(base, inputs);
  assert.deepEqual(compiled.publicData.resources.map((r) => r.id), ["wos-observation-sheet"]);

  const lesson = path.join(base, "content/courses/worldbuilding-operating-system/module-01-worldbuilding-fundamentals/01-01-what-is-worldbuilding.mdx");
  fs.writeFileSync(lesson, fs.readFileSync(lesson, "utf8").replace('kind: "lesson"', 'resourceIds: ["wos-project-seed-template"]\nkind: "lesson"'));
  await assert.rejects(compileCatalog(base, inputs), /published lesson cites withheld resource wos-project-seed-template/);
});

test("curriculum: published lessons link, planned lessons are labelled and never linked or locked", () => {
  const html = render(h(CourseCurriculum, { course: wos, lessons: queries.getLessonsByCourseSlug(wos.slug) }));
  assert.equal(html.match(/<details/g).length, 8);
  assert.equal(html.match(/<a /g).length, 1);
  assert.ok(html.includes(`href="${wosLesson}"`));
  assert.equal(html.match(/>Planned</g).length, 88 + 7, "88 planned lessons plus 7 planned modules");
  assert.match(html, /<details open=""/);
  assert.doesNotMatch(html, /\block(ed)?\b|paywall|premium|enrol/i);
});

// ---------------------------------------------------------------------------------------------
// Newsletter: canonical Studio rules, preview only, truthful states
// ---------------------------------------------------------------------------------------------

test("newsletter: validation mirrors Studio's schema", () => {
  assert.deepEqual(validateSubscription({ email: "  Reader@Example.COM ", consent: true }), { input: { email: "reader@example.com", consent: true } });
  assert.equal(validateSubscription({ email: "", consent: true }).error, "Please enter your email address.");
  assert.equal(validateSubscription({ email: "not-an-email", consent: true }).error, "Please enter a valid email address.");
  assert.equal(validateSubscription({ email: `${"a".repeat(250)}@x.io`, consent: true }).field, "email");
  assert.equal(validateSubscription({ email: "reader@example.com", consent: false }).field, "consent");
  assert.equal(validateSubscription({ email: "reader@example.com", consent: "true" }).field, "consent");
  assert.equal(validateSubscription(null).field, "email");
});

test("newsletter: this build is preview-only and holds no secrets", () => {
  assert.deepEqual(newsletterIntegration, { mode: "preview", endpoint: null });
  const html = render(h(GlobalNewsletterSection));
  assert.match(html, /data-newsletter-mode="preview"/);
  assert.match(html, /Keep a little curiosity in your inbox\./);
  assert.match(html, /<label[^>]*>Email address<\/label>/);
  assert.match(html, /type="email"[^>]*autoComplete="email"|autocomplete="email"/);
  assert.match(html, /I choose to receive Reltroner Studio updates\. I can unsubscribe through the link provided in future newsletters\./);
  assert.match(html, />Preview newsletter opt-in</);
  assert.match(html, /role="status" aria-live="polite"[^>]*>Preview: this form checks your entry here only\. It does not send your address or create a subscription\./);
  assert.doesNotMatch(html, /Subscribe to Studio updates|action=|method=/);
  assert.ok(html.includes(`href="${studioLinks.privacy}"`) && html.includes(`href="${studioLinks.newsletterPreferences}"`));
  for (const file of [...listSource("src"), ...listSource("scripts")]) {
    assert.doesNotMatch(read(file), /RESEND_API_KEY|NEXT_PUBLIC_[A-Z_]*(?:KEY|SECRET|TOKEN)\b|\bre_[A-Za-z0-9]{20,}/, file);
  }
});

const endpoint = "https://studio.example/api/newsletter";
const json = (status, body, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
const html502 = () => new Response("<html>Bad gateway</html>", { status: 502, headers: { "content-type": "text/html" } });

test("newsletter client: only a validated 2xx JSON result is a confirmed subscription", async () => {
  const calls = [];
  const fetcher = async (url, init) => { calls.push({ url, init }); return json(200, { status: "subscribed", message: "Subscribed.", delivered: false, verified: false }); };
  const client = createSubscriptionClient({ endpoint, fetcher });
  const ok = await client.submit({ email: "Reader@Example.com", consent: true });
  assert.deepEqual(ok, { confirmed: true, requestSent: true, result: { status: "subscribed", message: "Subscribed.", delivered: false, verified: false } });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, endpoint);
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.credentials, "omit");
  assert.deepEqual(JSON.parse(calls[0].init.body), { email: "reader@example.com", consent: true });

  const duplicate = await createSubscriptionClient({ endpoint, fetcher: async () => json(200, { status: "duplicate", message: "Already subscribed." }) })
    .submit({ email: "a@b.co", consent: true });
  assert.equal(duplicate.confirmed, true);
  assert.equal(duplicate.result.status, "duplicate");

  const invalid = await createSubscriptionClient({ endpoint, fetcher: async () => { throw new Error("must not send"); } })
    .submit({ email: "a@b.co", consent: false });
  assert.deepEqual([invalid.confirmed, invalid.requestSent, invalid.result.status], [false, false, "invalid"]);
});

test("newsletter client: HTML 502, 429, timeout, network, redirects and dishonest JSON are never success", async () => {
  const cases = [
    ["HTML 502", async () => html502(), "network-error", /HTTP 502 instead of a subscription result/],
    ["429", async () => new Response("slow down", { status: 429, headers: { "content-type": "text/plain" } }), "quota-error", /limit was reached/],
    ["network", async () => { throw new TypeError("Failed to fetch"); }, "network-error", /connection failed/],
    ["timeout", () => new Promise(() => {}), "network-error", /timed out/],
    ["redirect", async () => ({ status: 200, ok: true, redirected: true, headers: new Headers({ "content-type": "application/json" }), text: async () => "{}" }), "network-error", /HTTP 200/],
    ["claims delivery", async () => json(200, { status: "subscribed", message: "Sent!", delivered: true }), "network-error", /not a valid subscription result/],
    ["error status claiming success", async () => json(500, { status: "subscribed", message: "ok" }), "network-error", /not a valid subscription result/],
    ["unknown status", async () => json(200, { status: "done", message: "ok" }), "network-error", /not a valid subscription result/],
    ["oversized", async () => json(200, { status: "subscribed", message: "x".repeat(20_000) }), "network-error", /not a valid subscription result/],
  ];
  for (const [name, fetcher, status, message] of cases) {
    const attempt = await createSubscriptionClient({ endpoint, fetcher, timeoutMilliseconds: 25 }).submit({ email: "a@b.co", consent: true });
    assert.equal(attempt.confirmed, false, name);
    assert.equal(attempt.requestSent, true, name);
    assert.equal(attempt.result.status, status, name);
    assert.match(attempt.result.message, message, name);
    assert.equal(attempt.result.delivered, false, name);
  }
  const rejected = await createSubscriptionClient({ endpoint, fetcher: async () => json(422, { status: "rejected", message: "No." }) })
    .submit({ email: "a@b.co", consent: true });
  assert.deepEqual([rejected.confirmed, rejected.result.status], [false, "rejected"]);
});

test("newsletter client: no automatic retry; an uncertain outcome holds the next request", async () => {
  let now = 1_000_000;
  let sent = 0;
  const client = createSubscriptionClient({ endpoint, now: () => now, fetcher: async () => { sent++; return html502(); } });
  await client.submit({ email: "a@b.co", consent: true });
  const held = await client.submit({ email: "a@b.co", consent: true });
  assert.equal(sent, 1);
  assert.equal(held.requestSent, false);
  assert.match(held.result.message, /was not confirmed, so no additional request was sent/);
  now += 11_000;
  await client.submit({ email: "a@b.co", consent: true });
  assert.equal(sent, 2);

  const limited = createSubscriptionClient({ endpoint, now: () => now,
    fetcher: async () => new Response("", { status: 429, headers: { "retry-after": "120", "content-type": "text/plain" } }) });
  await limited.submit({ email: "a@b.co", consent: true });
  now += 60_000;
  assert.equal((await limited.submit({ email: "a@b.co", consent: true })).requestSent, false, "Retry-After is respected");
  assert.throws(() => createSubscriptionClient({ endpoint: "http://studio.example/api/newsletter" }), /HTTPS/);
});

// ---------------------------------------------------------------------------------------------
// Image slots and assistant presentation
// ---------------------------------------------------------------------------------------------

test("image slots: eight named slots, none approved yet, and approval fails closed", () => {
  assert.deepEqual(Object.fromEntries(Object.values(imageSlots).map((s) => [s.id, s.aspectRatio])), {
    HOME_HERO: "16 / 9", HOME_CAUSAL_MODEL: "3 / 2", COURSE_WOS_COVER: "16 / 9", PATH_WOS_JOURNEY: "3 / 2",
    AI_KNOWLEDGE_NETWORK: "16 / 9", ABOUT_CREATIVE_SEED: "16 / 9", ABOUT_TWO_DESTINATIONS: "3 / 2", MENTORSHIP_COLLABORATION: "4 / 3",
  });
  for (const slot of Object.values(imageSlots)) {
    assert.equal(resolveSlot(slot).approved, false);
    const html = render(h(ConceptImage, { slot: slot.id }));
    assert.match(html, new RegExp(`aria-hidden="true" data-image-slot="${slot.id}" data-placeholder="true"`));
    assert.match(html, /Illustration pending/);
    assert.doesNotMatch(html, /<img/);
  }
  const pinned = `https://cdn.jsdelivr.net/gh/Reltroner/lms-reltroner-resource@${"b".repeat(40)}/art/hero.webp`;
  assert.throws(() => resolveSlot({ ...imageSlots.HOME_HERO, src: pinned }), /alt text/);
  assert.throws(() => resolveSlot({ ...imageSlots.HOME_HERO, src: "https://images.example/stock.jpg", alt: "Stock" }), /pinned approved source/);
  assert.throws(() => resolveSlot({ ...imageSlots.HOME_HERO, src: pinned.replace("b".repeat(40), "main"), alt: "Hero" }), /pinned approved source/);
  assert.equal(resolveSlot({ ...imageSlots.HOME_HERO, src: pinned, alt: "An open book becoming a city" }).approved, true);
});

test("assistant: every reply states whether AI wrote it; retrieval-only shows excerpts, not generated text", () => {
  const excerpt = render(h(GroundedAnswer, { message: { id: "a", role: "assistant", state: "done", generationStatus: "retrieval_only",
    content: "Retrieval-only mode (no live LLM inference provider…)", sources: [{ title: "What Is Worldbuilding? — What is worldbuilding?", href: wosLesson, snippet: "Worldbuilding is the creative process…" }] } }));
  assert.match(excerpt, /Source excerpts · no AI-generated text/);
  assert.match(excerpt, /No AI service wrote this reply/);
  assert.match(excerpt, /Relevant excerpts/);
  assert.match(excerpt, /Worldbuilding is the creative process…/);
  assert.ok(excerpt.includes(`href="${wosLesson}"`));
  assert.doesNotMatch(excerpt, /Retrieval-only mode/);

  const generated = render(h(GroundedAnswer, { message: { id: "b", role: "assistant", state: "done", generationStatus: "generated",
    content: "Worldbuilding develops a world's conditions.", sources: [{ title: "Lesson", href: wosLesson }] } }));
  assert.match(generated, /AI answer · checked against cited sources/);
  assert.match(generated, />Sources</);
  for (const [status, label] of [["abstained", "No supporting source found"], ["refused", "Not available · published content only"], ["unavailable", "AI generation unavailable"]]) {
    assert.match(render(h(GroundedAnswer, { message: { id: status, role: "assistant", state: "done", generationStatus: status, content: "x" } })), new RegExp(label));
  }
});

test("pages: legacy /assistant redirects to /ai/; long-tail pages carry no fabricated people, progress or bookings", () => {
  assert.match(read("src/app/assistant/page.tsx"), /<meta httpEquiv="refresh" content="0;url=\/ai\/" \/>/);
  for (const file of ["src/app/dashboard/page.tsx", "src/app/my-learning/page.tsx", "src/app/account/page.tsx",
    "src/app/mentorship/page.tsx", "src/components/mentorship/BookingJourney.tsx", ...listSource("src/app/admin")]) {
    assert.doesNotMatch(read(file), /fixtures\/(learner|mentorship|admin)|Alex Rivera|Jordan Patel|Sage Okafor|@example\.com|progressPercent|mock/i, file);
  }
  for (const fixture of ["learner", "mentorship", "admin"]) {
    assert.ok(!fs.existsSync(path.join(root, `src/lib/fixtures/${fixture}.ts`)), `${fixture} fixture removed`);
  }
  assert.match(read("src/components/mentorship/BookingJourney.tsx"), /<fieldset disabled/);
});
