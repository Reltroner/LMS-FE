// Retain the existing MDX branch's resource location; no draft assets are copied to public/.
const base = "https://cdn.jsdelivr.net/gh/reltroner/reltroner-lms-assets@v0.1.0";
export function createJsDelivrUrl(assetPath: string) {
  return `${base}${assetPath.startsWith("/") ? assetPath : `/${assetPath}`}`;
}
