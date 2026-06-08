export const JSDELIVR_BASE_URL =
  "https://cdn.jsdelivr.net/gh/reltroner/reltroner-lms-assets@v0.1.0";

export function createJsDelivrUrl(assetPath: string) {
  const normalizedPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;

  return `${JSDELIVR_BASE_URL}${normalizedPath}`;
}
