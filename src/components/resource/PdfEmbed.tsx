import { getResourceById } from "@/lib/resource/resource-registry";

type PdfEmbedProps = {
  resourceId: string;
  showPreview?: boolean;
  className?: string;
};

export function PdfEmbed({ resourceId, showPreview = false, className }: PdfEmbedProps) {
  const resource = getResourceById(resourceId);

  if (!resource || resource.type !== "pdf") {
    return (
      <p className={className ?? "text-sm text-muted-foreground"}>
        PDF resource unavailable: {resourceId}
      </p>
    );
  }

  return (
    <div
      className={`not-prose space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm ${className ?? ""}`.trim()}
    >
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex rounded-sm text-sm font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        Open PDF
      </a>
      {showPreview ? (
        <iframe
          title={resource.title}
          src={resource.url}
          className="h-[32rem] w-full rounded-2xl border border-border"
        />
      ) : null}
    </div>
  );
}
