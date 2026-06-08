export type ResourceType = "image" | "video" | "audio" | "pdf" | "download" | "external-link";

type ResourceBase = Readonly<{
  id: string;
  courseSlug: string;
  type: ResourceType;
  title: string;
  summary?: string;
  url: string;
}>;

export type ImageResource = ResourceBase &
  Readonly<{
    type: "image";
    alt: string;
  }>;

export type VideoResource = ResourceBase &
  Readonly<{
    type: "video";
    posterUrl?: string;
  }>;

export type AudioResource = ResourceBase &
  Readonly<{
    type: "audio";
  }>;

export type PdfResource = ResourceBase &
  Readonly<{
    type: "pdf";
  }>;

export type DownloadResource = ResourceBase &
  Readonly<{
    type: "download";
    filename?: string;
  }>;

export type ExternalLinkResource = ResourceBase &
  Readonly<{
    type: "external-link";
  }>;

export type Resource =
  | ImageResource
  | VideoResource
  | AudioResource
  | PdfResource
  | DownloadResource
  | ExternalLinkResource;
