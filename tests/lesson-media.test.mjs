import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import { stringify } from "yaml";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { compileCatalog, parseLesson } from "../src/lib/content/compiler.ts";
import { createCourseQueries } from "../src/lib/content/queries.ts";
import { lessonMediaSchema } from "../src/lib/content/validators.ts";
import {
  cdnAssetUrl, resolveLessonMedia, spotifyEmbedUrl, spotifyEpisodeUrl, youtubeEmbedUrl, youtubeWatchUrl,
} from "../src/lib/content/lesson-media.ts";
import { catalogInputs } from "../scripts/catalog-inputs.ts";
import { preparePublicContent } from "../scripts/prepare-public-content.ts";
import { verifyPublicOutput } from "../scripts/verify-public-output.ts";

const root = process.cwd();

// Test-only module hooks so node:test renders the real TSX components:
// TypeScript transpiles JSX and "@/..." resolves like the tsconfig paths alias.
const srcUrl = pathToFileURL(path.join(root, "src") + path.sep);
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const match = [".ts", ".tsx"].map((ext) => new URL(specifier.slice(2) + ext, srcUrl)).find((url) => fs.existsSync(url));
      if (match) return { url: match.href, shortCircuit: true };
    }
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
const { LessonMediaSwitcher, LessonMediaPanel } = await import("../src/components/lesson/LessonMediaSwitcher.tsx");
const render = (element) => ReactDOMServer.renderToStaticMarkup(element);
const h = React.createElement;

const repository = "Reltroner/lms-reltroner-resource";
const revision = "c6f0263ca0ae888d02e87450b8d8a9a9351123ac";
const wosAssets = "courses/worldbuilding-operating-system/module-01-worldbuilding-fundamentals/01-01-what-is-worldbuilding";
// Fixture A: the approved WOS 01.01 sources.
const completeMedia = {
  video: { provider: "youtube", videoId: "zvlQTdSg4a8" },
  audio: { provider: "spotify", episodeId: "7dOB7rINnjDt000UAaIgrL" },
  slides: { provider: "github-cdn", repository, revision, path: `${wosAssets}/01-01-what-is-worldbuilding.pdf`, format: "pdf" },
  infographic: {
    provider: "github-cdn", repository, revision, path: `${wosAssets}/01-01-what-is-worldbuilding.png`, format: "png",
    alt: "Worldbuilding lesson infographic explaining how an imaginative idea develops through conditions, choices, possible consequences, and a bounded comparison with everyday reasoning.",
    width: 2752, height: 1536,
  },
};
const exactUrls = {
  videoEmbed: "https://www.youtube-nocookie.com/embed/zvlQTdSg4a8",
  videoWatch: "https://www.youtube.com/watch?v=zvlQTdSg4a8",
  audioEmbed: "https://open.spotify.com/embed/episode/7dOB7rINnjDt000UAaIgrL",
  audioEpisode: "https://open.spotify.com/episode/7dOB7rINnjDt000UAaIgrL",
  slides: `https://cdn.jsdelivr.net/gh/Reltroner/lms-reltroner-resource@${revision}/${wosAssets}/01-01-what-is-worldbuilding.pdf`,
  infographic: `https://cdn.jsdelivr.net/gh/Reltroner/lms-reltroner-resource@${revision}/${wosAssets}/01-01-what-is-worldbuilding.png`,
};
// Fixture B: video only.
const videoOnlyMedia = { video: { provider: "youtube", videoId: "VideoOnly01" } };
// Synthetic "Lesson 01.02": new identifiers and paths through metadata alone.
const fixtureRevision = "0123456789abcdef0123456789abcdef01234567";
const nextLessonMedia = {
  video: { provider: "youtube", videoId: "Fixture0102" },
  audio: { provider: "spotify", episodeId: "Fixture0102EpisodeAbcd" },
  slides: { provider: "github-cdn", repository, revision: fixtureRevision,
    path: "courses/fixture-course/module-01/01-02-fixture/01-02-fixture.pdf", format: "pdf" },
  infographic: { provider: "github-cdn", repository, revision: fixtureRevision,
    path: "courses/fixture-course/module-01/01-02-fixture/01-02-fixture.png", format: "png",
    alt: "Fixture infographic for a configuration-only lesson.", width: 1200, height: 3000 },
};
const draftMedia = {
  video: { provider: "youtube", videoId: "DraftVideo1" },
  audio: { provider: "spotify", episodeId: "DraftEpisode0000000000" },
  infographic: { provider: "github-cdn", repository, revision: fixtureRevision,
    path: "courses/fixture-course/unreleased/draft-infographic.png", format: "png",
    alt: "Unreleased draft infographic description.", width: 800, height: 600 },
};

const lessonSource = (title, { status = "published", media, body = "Isolated media fixture; never part of the real catalog." } = {}) =>
  `---\n${stringify({
    title, summary: "An isolated lesson media regression lesson.", kind: "lesson", status, level: "beginner",
    durationMinutes: 10, objectives: ["Explain the test topic."], outputs: ["Test notes"], tags: ["testing"],
    ...(media && { media }),
  })}---\n\n## ${title}\n\n${body}\n`;
const registry = (records) => ({ schema_version: 1, registry_authority: "LMS-FE_GIT_CONTENT_NOT_STUDIO_CANON", records });

function mediaCatalog(t, lessons = {
  "01-complete": lessonSource("Complete media fixture", { media: completeMedia }),
  "02-video-only": lessonSource("Video only fixture", { media: videoOnlyMedia }),
  "03-reading-only": lessonSource("Reading only fixture"),
  "04-next-lesson": lessonSource("Configuration only fixture", { media: nextLessonMedia }),
  "05-draft": lessonSource("Unreleased media fixture", { status: "draft", media: draftMedia }),
}) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "lms-media-test-"));
  t.after(() => {
    assert.equal(path.dirname(base), path.resolve(os.tmpdir()));
    assert.ok(path.basename(base).startsWith("lms-media-test-"));
    fs.rmSync(base, { recursive: true, force: true });
  });
  const records = Object.entries(lessons).map(([slug, source]) => {
    const source_path = `content/courses/media-course/lessons/${slug}.mdx`;
    fs.mkdirSync(path.dirname(path.join(base, source_path)), { recursive: true });
    fs.writeFileSync(path.join(base, source_path), source);
    return { lesson_id: `test-media-${slug}`, source_path, legacy_route: `/courses/media-course/lessons/${slug}` };
  });
  const inputs = {
    catalog: [{ course: {
      id: "course-media", slug: "media-course", title: "Media course", subtitle: "Test course", summary: "Test course summary",
      category: "worldbuilding", level: "beginner", status: "published", estimatedHours: 1,
      modules: [{ id: "module-media", slug: "media", title: "Media", summary: "Media fixtures", directory: "lessons",
        lessonSlugs: Object.keys(lessons) }],
    }, resources: [] }],
    paths: [], publicCourseSlugs: ["media-course"], publicPathSlugs: [],
    legacyRegistry: { ...registry([]), lesson_count: 0 }, additionsRegistry: registry(records),
    denylist: { schema_version: 1, denied: [] },
  };
  return { base, inputs };
}

const tagsOf = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "g"))].map(([tag]) => tag);
const attr = (tag, name) => new RegExp(`\\s${name}="([^"]*)"`, "i").exec(tag)?.[1];
const tabsOf = (html) => [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(([, tag, inner]) => ({
  label: inner.replace(/<[^>]+>/g, "").trim(), selected: attr(tag, "aria-selected"), tabindex: attr(tag, "tabindex"),
  id: attr(tag, "id"), controls: attr(tag, "aria-controls"), role: attr(tag, "role"),
}));
const switcher = (media, title = "Fixture lesson") =>
  render(h(LessonMediaSwitcher, { media: resolveLessonMedia(media), lessonTitle: title }, h("p", null, "Reading body")));
const panel = (view, title = "Fixture lesson") => render(h(LessonMediaPanel, { view, lessonTitle: title }));

test("approved WOS 01.01 identifiers resolve to the exact pinned provider URLs", () => {
  assert.equal(youtubeEmbedUrl("zvlQTdSg4a8"), exactUrls.videoEmbed);
  assert.equal(youtubeWatchUrl("zvlQTdSg4a8"), exactUrls.videoWatch);
  assert.equal(spotifyEmbedUrl("7dOB7rINnjDt000UAaIgrL"), exactUrls.audioEmbed);
  assert.equal(spotifyEpisodeUrl("7dOB7rINnjDt000UAaIgrL"), exactUrls.audioEpisode);
  assert.equal(cdnAssetUrl(completeMedia.slides), exactUrls.slides);
  assert.equal(cdnAssetUrl(completeMedia.infographic), exactUrls.infographic);
  assert.ok(lessonMediaSchema.safeParse(completeMedia).success);
  assert.deepEqual(resolveLessonMedia(completeMedia), [
    { format: "video", embedUrl: exactUrls.videoEmbed, externalUrl: exactUrls.videoWatch },
    { format: "audio", embedUrl: exactUrls.audioEmbed, externalUrl: exactUrls.audioEpisode },
    { format: "slides", url: exactUrls.slides, source: `${repository}@c6f0263` },
    { format: "infographic", url: exactUrls.infographic, source: `${repository}@c6f0263`,
      alt: completeMedia.infographic.alt, width: 2752, height: 1536 },
  ]);
});

test("registered WOS 01.01 carries the approved media through the real compiler and is published", async () => {
  const { allLessons, publicData } = await compileCatalog(root, catalogInputs(root));
  const lesson = allLessons.find((l) => l.id === "lms-lesson-0032");
  assert.equal(lesson.status, "published");
  assert.deepEqual(lesson.media, completeMedia);
  assert.deepEqual(resolveLessonMedia(lesson.media).map((view) => view.embedUrl ?? view.url),
    [exactUrls.videoEmbed, exactUrls.audioEmbed, exactUrls.slides, exactUrls.infographic]);
  assert.match(JSON.stringify(publicData), /zvlQTdSg4a8/);
  assert.match(JSON.stringify(publicData), /7dOB7rINnjDt000UAaIgrL/);
  assert.match(JSON.stringify(publicData), /01-01-what-is-worldbuilding/);
});

const set = (kind, patch) => (media) => { media[kind] = { ...media[kind], ...patch }; };
const invalidMedia = [
  ["YouTube ID too short", set("video", { videoId: "zvlQTdSg4a" })],
  ["YouTube ID too long", set("video", { videoId: "zvlQTdSg4a8x" })],
  ["YouTube ID with illegal characters", set("video", { videoId: "zvlQTdSg4a!" })],
  ["YouTube share URL instead of an ID", set("video", { videoId: "https://youtu.be/zvlQTdSg4a8" })],
  ["YouTube embed URL instead of an ID", set("video", { videoId: "https://www.youtube.com/embed/zvlQTdSg4a8" })],
  ["unsupported video provider", set("video", { provider: "vimeo" })],
  ["Spotify ID with wrong length", set("audio", { episodeId: "7dOB7rINnjDt000UAaIgr" })],
  ["Spotify URL instead of an ID", set("audio", { episodeId: "https://open.spotify.com/episode/7dOB7rINnjDt000UAaIgrL" })],
  ["Spotify URI instead of an ID", set("audio", { episodeId: "spotify:episode:7dOB7rINnjDt000UAaIgrL" })],
  ["Spotify ID with sharing parameter", set("audio", { episodeId: "7dOB7rINnjDt000UAaIgrL?si=share" })],
  ["unapproved repository", set("slides", { repository: "attacker/lms-reltroner-resource" })],
  ["repository look-alike casing", set("slides", { repository: "reltroner/LMS-RELTRONER-RESOURCE" })],
  ["foreign CDN host as repository", set("slides", { repository: "evil.example/assets" })],
  ["unsupported CDN provider", set("infographic", { provider: "jsdelivr" })],
  ["mutable branch revision", set("slides", { revision: "main" })],
  ["short commit revision", set("slides", { revision: "c6f0263" })],
  ["uppercase commit revision", set("slides", { revision: revision.toUpperCase() })],
  ["parent traversal", set("slides", { path: "../secret.pdf" })],
  ["nested traversal", set("slides", { path: "courses/../../secret.pdf" })],
  ["current-directory segment", set("slides", { path: "./slides.pdf" })],
  ["absolute path", set("slides", { path: "/etc/slides.pdf" })],
  ["Windows drive path", set("slides", { path: "C:/slides.pdf" })],
  ["backslash traversal", set("slides", { path: "courses\\..\\slides.pdf" })],
  ["empty segment", set("slides", { path: "courses//slides.pdf" })],
  ["hidden dot segment", set("slides", { path: ".github/slides.pdf" })],
  ["percent-encoded traversal", set("slides", { path: "%2e%2e/slides.pdf" })],
  ["double-encoded traversal", set("slides", { path: "%252e%252e/slides.pdf" })],
  ["encoded slash traversal", set("infographic", { path: "courses%2f..%2finfographic.png" })],
  ["query string", set("slides", { path: "slides.pdf?download=.pdf" })],
  ["fragment", set("slides", { path: "slides.pdf#.pdf" })],
  ["javascript scheme", set("slides", { path: "javascript:alert(1)//.pdf" })],
  ["data scheme", set("infographic", { path: "data:image/png;base64,AAAA.png" })],
  ["absolute URL to another host", set("slides", { path: "https://evil.example/slides.pdf" })],
  ["Unicode two-dot leader", set("slides", { path: "courses/\u2025/slides.pdf" })],
  ["full-width dots", set("slides", { path: "courses/\uff0e\uff0e/slides.pdf" })],
  ["right-to-left override", set("slides", { path: "courses/fdp\u202e.slides.pdf" })],
  ["NUL control character", set("slides", { path: "courses/slides\u0000.pdf" })],
  ["newline control character", set("slides", { path: "courses/\nslides.pdf" })],
  ["whitespace", set("slides", { path: "courses/my slides.pdf" })],
  ["wrong slides extension", set("slides", { path: "courses/slides.png" })],
  ["uppercase slides extension", set("slides", { path: "courses/slides.PDF" })],
  ["double extension", set("slides", { path: "courses/slides.pdf.exe" })],
  ["unsupported slides format", set("slides", { format: "pptx", path: "courses/slides.pptx" })],
  ["wrong infographic extension", set("infographic", { path: "courses/infographic.jpg" })],
  ["SVG infographic", set("infographic", { format: "svg", path: "courses/infographic.svg" })],
  ["PDF used as infographic", set("infographic", { path: "courses/infographic.pdf" })],
  ["missing infographic alt", (media) => { delete media.infographic.alt; }],
  ["blank infographic alt", set("infographic", { alt: "   " })],
  ["fractional infographic width", set("infographic", { width: 10.5 })],
  ["zero infographic height", set("infographic", { height: 0 })],
  ["authored embed URL field", set("video", { embedUrl: "https://evil.example/embed" })],
  ["authored CDN URL field", set("slides", { url: "https://evil.example/slides.pdf" })],
  ["arbitrary iframe format", (media) => { media.iframe = { src: "https://evil.example" }; }],
  ["empty media declaration", (media) => { for (const key of Object.keys(media)) delete media[key]; }],
];
for (const [name, mutate] of invalidMedia) {
  test(`invalid lesson media fails validation: ${name}`, () => {
    const media = structuredClone(completeMedia);
    mutate(media);
    assert.equal(lessonMediaSchema.safeParse(media).success, false);
  });
}

test("trusted URL builders refuse unvalidated identifiers instead of emitting embeds", () => {
  for (const build of [youtubeEmbedUrl, youtubeWatchUrl]) {
    assert.throws(() => build("https://youtu.be/zvlQTdSg4a8"), /Untrusted YouTube video ID/);
  }
  for (const build of [spotifyEmbedUrl, spotifyEpisodeUrl]) {
    assert.throws(() => build("javascript:alert(1)"), /Untrusted Spotify episode ID/);
  }
  for (const patch of [{ repository: "attacker/repo" }, { revision: "main" }, { path: "../x.pdf" },
    { path: "x.pdf?x=.pdf" }, { provider: "other" }, { path: "slides.png" }]) {
    assert.throws(() => cdnAssetUrl({ ...completeMedia.slides, ...patch }), /Untrusted lesson media asset/);
  }
});

test("duplicate media definitions are rejected at the frontmatter boundary", () => {
  const source = lessonSource("Duplicate media fixture", { media: videoOnlyMedia })
    .replace("media:\n", "media:\n  video:\n    provider: youtube\n    videoId: zvlQTdSg4a8\n");
  assert.throws(() => parseLesson(source, "duplicate.mdx"), /unique/);
});

test("media survives legitimate public compilation without changing navigation", async (t) => {
  const { base, inputs } = mediaCatalog(t);
  const q = createCourseQueries((await compileCatalog(base, inputs)).publicData);
  assert.deepEqual(q.getLessonBySlug("media-course", "01-complete").media, completeMedia);
  assert.deepEqual(q.getLessonBySlug("media-course", "02-video-only").media, videoOnlyMedia);
  assert.ok(!("media" in q.getLessonBySlug("media-course", "03-reading-only")));
  assert.deepEqual(resolveLessonMedia(q.getLessonBySlug("media-course", "03-reading-only").media), []);
  assert.deepEqual(resolveLessonMedia(q.getLessonBySlug("media-course", "02-video-only").media).map((v) => v.format), ["video"]);
  assert.deepEqual(q.getLessonsByCourseSlug("media-course").map((l) => l.slug),
    ["01-complete", "02-video-only", "03-reading-only", "04-next-lesson"]);
  assert.equal(q.getLessonNavigation("media-course", "02-video-only").previous.slug, "01-complete");
  assert.equal(q.getLessonNavigation("media-course", "02-video-only").next.slug, "03-reading-only");
  assert.equal(q.getLessonNavigation("media-course", "04-next-lesson").next, null);
});

test("Fixture A: Reading is the default and nothing third-party is fetched until a format is chosen", () => {
  const html = switcher(completeMedia);
  const tabs = tabsOf(html);
  assert.deepEqual(tabs.map((tab) => tab.label), ["Reading", "Watch Video", "Listen to Audio", "View Slides", "View Infographic"]);
  assert.ok(tabs.every((tab) => tab.role === "tab"));
  assert.deepEqual(tabs.map((tab) => [tab.selected, tab.tabindex]),
    [["true", "0"], ["false", "-1"], ["false", "-1"], ["false", "-1"], ["false", "-1"]]);
  const panels = tagsOf(html, "div").filter((tag) => attr(tag, "role") === "tabpanel");
  assert.equal(panels.length, 5);
  for (const tab of tabs) {
    const target = panels.find((tag) => attr(tag, "id") === tab.controls);
    assert.ok(target, `${tab.label} controls an existing panel`);
    assert.equal(attr(target, "aria-labelledby"), tab.id);
  }
  assert.match(html, /role="tablist" aria-label="Lesson formats"/);
  assert.match(html, /<div role="tabpanel"(?![^>]*hidden)[^>]*><p>Reading body<\/p><\/div>/);
  assert.equal(html.match(/<div role="tabpanel"[^>]*hidden=""[^>]*><\/div>/g).length, 4, "inactive panels are empty");
  assert.doesNotMatch(html, /<iframe|<img|youtube|spotify|jsdelivr/i);
});

test("Fixture B: a partial-media lesson renders only its own formats", () => {
  const html = switcher(videoOnlyMedia);
  assert.deepEqual(tabsOf(html).map((tab) => tab.label), ["Reading", "Watch Video"]);
  assert.doesNotMatch(html, /Listen to Audio|View Slides|View Infographic/);
  assert.equal(tagsOf(html, "div").filter((tag) => attr(tag, "role") === "tabpanel").length, 2);
});

test("Fixture C: a reading-only lesson keeps the existing reader markup with no media toolbar", () => {
  const body = h("div", { className: "prose-reltroner max-w-none" }, h("p", null, "Reading body"));
  const html = render(h(LessonMediaSwitcher, { media: resolveLessonMedia(undefined), lessonTitle: "Fixture" }, body));
  assert.equal(html, render(body));
  assert.doesNotMatch(html, /tablist|tabpanel/);
});

test("each provider adapter renders one restricted frame or image plus a direct fallback", () => {
  const [video, audio, slides, infographic] = resolveLessonMedia(completeMedia).map((view) => panel(view, "What Is Worldbuilding?"));
  for (const [html, src, title, link, label, referrer] of [
    [video, exactUrls.videoEmbed, "Video: What Is Worldbuilding?", exactUrls.videoWatch, "Watch on YouTube", "strict-origin-when-cross-origin"],
    [audio, exactUrls.audioEmbed, "Audio: What Is Worldbuilding?", exactUrls.audioEpisode, "Listen on Spotify", "strict-origin-when-cross-origin"],
    [slides, exactUrls.slides, "Slides: What Is Worldbuilding?", exactUrls.slides, "Open slides (PDF) in a new tab", "no-referrer"],
  ]) {
    const frames = tagsOf(html, "iframe");
    assert.equal(frames.length, 1, "exactly one frame per selected format");
    assert.equal(attr(frames[0], "src"), src);
    assert.equal(attr(frames[0], "title"), title);
    assert.equal(attr(frames[0], "loading"), "lazy");
    assert.equal(attr(frames[0], "referrerPolicy"), referrer);
    assert.doesNotMatch(frames[0], /autoplay|allow-top-navigation|allow-forms|allow-modals/);
    const anchor = tagsOf(html, "a")[0];
    assert.equal(attr(anchor, "href"), link);
    assert.equal(attr(anchor, "target"), "_blank");
    assert.equal(attr(anchor, "rel"), "noopener noreferrer");
    assert.match(html, new RegExp(`${label.replace(/[()]/g, "\\$&")}<svg[\\s\\S]*?\\(opens in a new tab\\)`));
    assert.match(html, /role="status">Loading the /);
  }
  for (const html of [video, audio]) {
    assert.equal(attr(tagsOf(html, "iframe")[0], "sandbox"),
      html === video ? "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"
        : "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox");
  }
  assert.match(slides, /Source: Reltroner\/lms-reltroner-resource@c6f0263 via jsDelivr/);
  assert.equal(tagsOf(infographic, "iframe").length, 0);
  const images = tagsOf(infographic, "img");
  assert.equal(images.length, 1);
  assert.equal(attr(images[0], "src"), exactUrls.infographic);
  assert.equal(attr(images[0], "alt"), completeMedia.infographic.alt);
  assert.deepEqual(["width", "height", "loading", "decoding", "referrerPolicy"].map((name) => attr(images[0], name)),
    ["2752", "1536", "lazy", "async", "no-referrer"]);
  assert.equal(attr(tagsOf(infographic, "a")[0], "href"), exactUrls.infographic);
  assert.match(infographic, /Open full-resolution image/);
});

test("configuration-only extension: a second lesson renders its own media with unchanged components", () => {
  const views = resolveLessonMedia(nextLessonMedia);
  assert.deepEqual(views.map((view) => view.format), ["video", "audio", "slides", "infographic"]);
  const html = views.map((view) => panel(view, "Fixture 01.02")).join("\n");
  assert.match(html, /src="https:\/\/www\.youtube-nocookie\.com\/embed\/Fixture0102"/);
  assert.match(html, /src="https:\/\/open\.spotify\.com\/embed\/episode\/Fixture0102EpisodeAbcd"/);
  assert.match(html, new RegExp(`@${fixtureRevision}/courses/fixture-course/module-01/01-02-fixture/01-02-fixture\\.pdf"`));
  assert.match(html, /width="1200" height="3000"/);
  assert.doesNotMatch(html, /zvlQTdSg4a8|7dOB7rINnjDt000UAaIgrL|01-01-what-is-worldbuilding/);
  assert.deepEqual(tabsOf(switcher(nextLessonMedia)).map((tab) => tab.label),
    ["Reading", "Watch Video", "Listen to Audio", "View Slides", "View Infographic"]);
  for (const file of ["src/components/lesson/LessonMediaSwitcher.tsx", "src/lib/content/lesson-media.ts",
    "src/app/courses/[slug]/lessons/[lesson]/page.tsx"]) {
    assert.doesNotMatch(fs.readFileSync(path.join(root, file), "utf8"), /zvlQTdSg4a8|7dOB7rINnjDt000UAaIgrL|what-is-worldbuilding|01-02/,
      `${file} stays lesson-agnostic`);
  }
});

test("draft lesson media never reaches public data, staged bundles, or routes", async (t) => {
  const { base, inputs } = mediaCatalog(t);
  const result = await preparePublicContent(base, inputs);
  const q = createCourseQueries(result.publicData);
  assert.equal(q.getLessonBySlug("media-course", "05-draft"), undefined);
  assert.ok(!q.getLessonRouteParams().some((p) => p.lesson === "05-draft"));
  const staged = path.join(base, ".public-content");
  const files = fs.readdirSync(staged, { recursive: true }).map(String).filter((file) => fs.statSync(path.join(staged, file)).isFile());
  const content = files.map((file) => fs.readFileSync(path.join(staged, file), "utf8")).join("\n");
  assert.match(content, /zvlQTdSg4a8/, "published media is staged");
  for (const secret of ["DraftVideo1", "DraftEpisode0000000000", "unreleased/draft-infographic.png", "05-draft"]) {
    assert.ok(!content.includes(secret) && !files.some((file) => file.includes(secret)), `${secret} stays private`);
  }
});

for (const [name, mutate] of [
  ["draft course accidentally allowlisted", (inputs) => { inputs.catalog[0].course.status = "draft"; }],
  ["archived course accidentally allowlisted", (inputs) => { inputs.catalog[0].course.status = "archived"; }],
  ["denied published course", (inputs) => { inputs.denylist.denied.push({ kind: "course", slug: "media-course", route: "/courses/media-course", title: "Media course" }); }],
  ["published course missing from the allowlist", (inputs) => { inputs.publicCourseSlugs = []; }],
]) {
  test(`publication gates keep lesson media private: ${name}`, async (t) => {
    const { base, inputs } = mediaCatalog(t);
    mutate(inputs);
    const { publicData } = await compileCatalog(base, inputs);
    assert.deepEqual(publicData.lessons, []);
    assert.doesNotMatch(JSON.stringify(publicData), /zvlQTdSg4a8|VideoOnly01|Fixture0102|DraftVideo1/);
  });
}

test("public output scanner treats private lesson media identifiers as restricted", async (t) => {
  const { base, inputs } = mediaCatalog(t);
  const q = createCourseQueries((await compileCatalog(base, inputs)).publicData);
  const output = path.join(base, "out");
  for (const route of ["", "courses", "paths", "search", "my-learning", "ai", "about",
    ...q.getCourseRouteParams().map((p) => `courses/${p.slug}`),
    ...q.getLessonRouteParams().map((p) => `courses/${p.slug}/lessons/${p.lesson}`)]) {
    fs.mkdirSync(path.join(output, route), { recursive: true });
    fs.writeFileSync(path.join(output, route, "index.html"), "<main>Public fixture</main>");
  }
  fs.writeFileSync(path.join(output, "public-media.js"), `"${exactUrls.videoEmbed}"`);
  assert.ok((await verifyPublicOutput(base, inputs)).files > 0, "published media may appear");
  for (const leak of ['"DraftVideo1"', '"DraftEpisode0000000000"', String.raw`"courses\/fixture-course\/unreleased\/draft-infographic.png"`,
    '"Unreleased draft infographic description."']) {
    fs.writeFileSync(path.join(output, "leak.js"), leak);
    await assert.rejects(verifyPublicOutput(base, inputs), /Private content in leak\.js/);
  }
});

for (const [name, body, cause] of [
  ["raw iframe", '<iframe src="https://evil.example/embed" />', /Unsupported MDX component: iframe/],
  ["provider component", '<YouTube videoId="zvlQTdSg4a8" />', /Unsupported MDX component: YouTube/],
  ["executable expression", '{fetch("https://evil.example")}', /executable expressions/],
]) {
  test(`lesson MDX cannot inject media: ${name}`, async (t) => {
    const { base, inputs } = mediaCatalog(t, { "01-injected": lessonSource("Injected media fixture", { body }) });
    await assert.rejects(compileCatalog(base, inputs), (error) => {
      assert.match(error.message, /MDX compilation failed/);
      assert.match(String(error.cause?.message), cause);
      return true;
    });
  });
}
