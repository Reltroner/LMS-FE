// Trusted lesson-media boundary: every embed and asset URL is built here from validated
// identifiers, never copied from authored URLs. Client-safe: no Node, Zod or catalog imports.
import type { LessonMedia, LessonMediaAsset } from "../../types/course.ts";

export const youtubeVideoIdPattern = /^[A-Za-z0-9_-]{11}$/;
export const spotifyEpisodeIdPattern = /^[A-Za-z0-9]{22}$/;
export const commitShaPattern = /^[0-9a-f]{40}$/;
// Publication policy, not a convenience list: lesson assets come only from these repositories.
export const approvedMediaRepositories: readonly string[] = ["Reltroner/lms-reltroner-resource"];

// ASCII segments only, never starting with a dot: rejects traversal, percent-encoding,
// queries, fragments, schemes, backslashes, empty segments and Unicode look-alikes.
const assetSegment = /^[A-Za-z0-9_-][A-Za-z0-9._-]*$/;
export function isSafeAssetPath(value: string, extension: `.${string}`) {
  return value.length <= 512 && value.endsWith(extension) &&
    value.split("/").every((segment) => assetSegment.test(segment));
}

function checked(value: string, pattern: RegExp, label: string) {
  if (!pattern.test(value)) throw new Error(`Untrusted ${label}: ${value}`);
  return value;
}

export const youtubeEmbedUrl = (videoId: string) =>
  `https://www.youtube-nocookie.com/embed/${checked(videoId, youtubeVideoIdPattern, "YouTube video ID")}`;
export const youtubeWatchUrl = (videoId: string) =>
  `https://www.youtube.com/watch?v=${checked(videoId, youtubeVideoIdPattern, "YouTube video ID")}`;
export const spotifyEmbedUrl = (episodeId: string) =>
  `https://open.spotify.com/embed/episode/${checked(episodeId, spotifyEpisodeIdPattern, "Spotify episode ID")}`;
export const spotifyEpisodeUrl = (episodeId: string) =>
  `https://open.spotify.com/episode/${checked(episodeId, spotifyEpisodeIdPattern, "Spotify episode ID")}`;

// Markdown lesson images: a pinned asset from an approved repository on jsDelivr, or a
// site-relative file whose existence in public/ the compiler checks. Anything else is rejected.
const imageExtension = /\.(?:svg|png|jpe?g|webp)$/;
const pinnedCdnAsset = /^https:\/\/cdn\.jsdelivr\.net\/gh\/([^/@]+\/[^/@]+)@([^/]+)\/(.+)$/;
export function lessonImageSource(url: string): "cdn" | "site" | null {
  const extension = imageExtension.exec(url)?.[0] as `.${string}` | undefined;
  if (!extension) return null;
  if (url.startsWith("/")) return isSafeAssetPath(url.slice(1), extension) ? "site" : null;
  return isPinnedApprovedCdnUrl(url) ? "cdn" : null;
}

// A file pinned to a commit of an approved resource repository, served by jsDelivr. Tags and
// branches are mutable, and other repositories are not reviewed sources.
export function isPinnedApprovedCdnUrl(url: string) {
  const [, repository, revision, assetPath] = pinnedCdnAsset.exec(url) ?? [];
  const extension = /\.[A-Za-z0-9]+$/.exec(assetPath ?? "")?.[0] as `.${string}` | undefined;
  return Boolean(assetPath && extension && approvedMediaRepositories.includes(repository) &&
    commitShaPattern.test(revision) && isSafeAssetPath(assetPath, extension));
}

export function cdnAssetUrl(asset: LessonMediaAsset & { format: "pdf" | "png" }) {
  if (asset.provider !== "github-cdn" || !approvedMediaRepositories.includes(asset.repository) ||
      !commitShaPattern.test(asset.revision) || !isSafeAssetPath(asset.path, `.${asset.format}`)) {
    throw new Error(`Untrusted lesson media asset: ${asset.repository}/${asset.path}`);
  }
  return `https://cdn.jsdelivr.net/gh/${asset.repository}@${asset.revision}/${asset.path}`;
}

// Serializable props for the client media switcher.
export type LessonMediaView =
  | Readonly<{ format: "video" | "audio"; embedUrl: string; externalUrl: string }>
  | Readonly<{ format: "slides"; url: string; source: string }>
  | Readonly<{ format: "infographic"; url: string; source: string; alt: string; width: number; height: number }>;
export type LessonMediaFormat = LessonMediaView["format"];

// Fixed format order. An absent format yields no view, so no empty tab can render.
export function resolveLessonMedia(media: LessonMedia | undefined): LessonMediaView[] {
  if (!media) return [];
  const source = (asset: LessonMediaAsset) => `${asset.repository}@${asset.revision.slice(0, 7)}`;
  const views: LessonMediaView[] = [];
  if (media.video) {
    const { videoId } = media.video;
    views.push({ format: "video", embedUrl: youtubeEmbedUrl(videoId), externalUrl: youtubeWatchUrl(videoId) });
  }
  if (media.audio) {
    const { episodeId } = media.audio;
    views.push({ format: "audio", embedUrl: spotifyEmbedUrl(episodeId), externalUrl: spotifyEpisodeUrl(episodeId) });
  }
  if (media.slides) {
    views.push({ format: "slides", url: cdnAssetUrl(media.slides), source: source(media.slides) });
  }
  if (media.infographic) {
    const { alt, width, height } = media.infographic;
    views.push({ format: "infographic", url: cdnAssetUrl(media.infographic), source: source(media.infographic),
      alt, width, height });
  }
  return views;
}
