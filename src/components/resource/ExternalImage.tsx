/* eslint-disable @next/next/no-img-element */

import { getResourceById } from "@/lib/resource/resource-registry";

type ExternalImageProps = {
  resourceId: string;
  className?: string;
};

export function ExternalImage({ resourceId, className }: ExternalImageProps) {
  const resource = getResourceById(resourceId);

  if (!resource || resource.type !== "image") {
    return (
      <p className={className ?? "text-sm text-muted-foreground"}>
        Image resource unavailable: {resourceId}
      </p>
    );
  }

  return (
    <img
      src={resource.url}
      alt={resource.alt}
      loading="lazy"
      className={`h-auto w-full rounded-2xl border border-border shadow-sm ${className ?? ""}`.trim()}
    />
  );
}
