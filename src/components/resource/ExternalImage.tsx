import { getResourceById } from "@/lib/resource/resource-registry";

type ExternalImageProps = {
  resourceId: string;
  className?: string;
};

export function ExternalImage({ resourceId, className }: ExternalImageProps) {
  const resource = getResourceById(resourceId);

  if (!resource || resource.type !== "image") {
    return (
      <p className={className ?? "text-sm text-zinc-500"}>
        Image resource unavailable: {resourceId}
      </p>
    );
  }

  return (
    <img
      src={resource.url}
      alt={resource.alt}
      loading="lazy"
      className={`h-auto w-full rounded-2xl border border-zinc-200 ${className ?? ""}`.trim()}
    />
  );
}
