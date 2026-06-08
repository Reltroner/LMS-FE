import { getResourceById } from "@/lib/resource/resource-registry";

type AudioEmbedProps = {
  resourceId: string;
  className?: string;
};

export function AudioEmbed({ resourceId, className }: AudioEmbedProps) {
  const resource = getResourceById(resourceId);

  if (!resource || resource.type !== "audio") {
    return (
      <p className={className ?? "text-sm text-muted-foreground"}>
        Audio resource unavailable: {resourceId}
      </p>
    );
  }

  return (
    <audio
      className={`w-full rounded-2xl border border-border bg-white p-3 shadow-sm ${className ?? ""}`.trim()}
      controls
      preload="metadata"
    >
      <source src={resource.url} />
      <a href={resource.url} target="_blank" rel="noopener noreferrer">
        Open audio
      </a>
    </audio>
  );
}
