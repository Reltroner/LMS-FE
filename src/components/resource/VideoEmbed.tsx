import { getResourceById } from "@/lib/resource/resource-registry";

type VideoEmbedProps = {
  resourceId: string;
  className?: string;
};

export function VideoEmbed({ resourceId, className }: VideoEmbedProps) {
  const resource = getResourceById(resourceId);

  if (!resource || resource.type !== "video") {
    return (
      <p className={className ?? "text-sm text-muted-foreground"}>
        Video resource unavailable: {resourceId}
      </p>
    );
  }

  return (
    <video
      className={`w-full rounded-2xl border border-border bg-slate-950 shadow-sm ${className ?? ""}`.trim()}
      controls
      preload="metadata"
      poster={resource.posterUrl}
    >
      <source src={resource.url} />
      <a href={resource.url} target="_blank" rel="noopener noreferrer">
        Open video
      </a>
    </video>
  );
}
