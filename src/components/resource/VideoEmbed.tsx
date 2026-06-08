import { getResourceById } from "@/lib/resource/resource-registry";

type VideoEmbedProps = {
  resourceId: string;
  className?: string;
};

export function VideoEmbed({ resourceId, className }: VideoEmbedProps) {
  const resource = getResourceById(resourceId);

  if (!resource || resource.type !== "video") {
    return (
      <p className={className ?? "text-sm text-zinc-500"}>
        Video resource unavailable: {resourceId}
      </p>
    );
  }

  return (
    <video
      className={`w-full rounded-2xl border border-zinc-200 bg-zinc-950 ${className ?? ""}`.trim()}
      controls
      preload="metadata"
      poster={resource.posterUrl}
    >
      <source src={resource.url} />
      <a href={resource.url} target="_blank" rel="noreferrer">
        Open video
      </a>
    </video>
  );
}
