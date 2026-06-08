import type { ResourceType } from "../../types/resource";

export const resourceTypes = [
  "image",
  "video",
  "audio",
  "pdf",
  "download",
  "external-link",
] as const satisfies readonly ResourceType[];
