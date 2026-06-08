import { JSDELIVR_BASE_URL } from "@/catalog/resources/jsdelivr";

export function createAssetUrl(assetPath: string, baseUrl = JSDELIVR_BASE_URL) {
  const normalizedPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;

  return `${baseUrl}${normalizedPath}`;
}

export function isJsDelivrUrl(url: string) {
  return url.startsWith("https://cdn.jsdelivr.net/gh/");
}

export function isPinnedJsDelivrUrl(url: string) {
  if (!isJsDelivrUrl(url)) {
    return true;
  }

  const versionMatch = url.match(/\/gh\/[^/]+\/[^/@]+@([^/]+)/);
  const version = versionMatch?.[1];

  return version ? !["main", "master", "latest"].includes(version) : false;
}
