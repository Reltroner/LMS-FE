import { isPinnedJsDelivrUrl } from "@/lib/resource/asset-url";
import type { Resource } from "@/types/resource";

export function validateResourceUrl(resource: Resource): string | undefined {
  if (!URL.canParse(resource.url)) {
    return `Resource ${resource.id} has an invalid URL.`;
  }

  if (!isPinnedJsDelivrUrl(resource.url)) {
    return `Resource ${resource.id} uses an unpinned jsDelivr URL.`;
  }

  return undefined;
}
