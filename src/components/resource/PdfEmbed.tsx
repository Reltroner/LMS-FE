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
      <p className={className ?? "text-sm text-zinc-500"}>PDF resource unavailable: {resourceId}</p>
    );
  }

  return (
    <div className={`space-y-4 ${className ?? ""}`.trim()}>
      <a
        href={resource.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex rounded-sm text-sm font-semibold text-zinc-950 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-700"
      >
        Open PDF
      </a>
      {showPreview ? (
        <iframe
          title={resource.title}
          src={resource.url}
          className="h-[32rem] w-full rounded-2xl border border-zinc-200"
        />
      ) : null}
    </div>
  );
}
