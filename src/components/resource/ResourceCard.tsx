import { getResourceById } from "@/lib/resource/resource-registry";

type ResourceCardProps = {
  resourceId: string;
  className?: string;
};

export function ResourceCard({ resourceId, className }: ResourceCardProps) {
  const resource = getResourceById(resourceId);

  if (!resource) {
    return (
      <div className={className}>
        <p className="rounded-2xl border border-dashed border-border bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          Resource unavailable: {resourceId}
        </p>
      </div>
    );
  }

  return (
    <article
      className={`not-prose rounded-2xl border border-border bg-white p-5 shadow-sm ${className ?? ""}`.trim()}
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {resource.type}
        </p>
        <h3 className="text-xl font-semibold text-foreground">{resource.title}</h3>
        {resource.summary ? (
          <p className="text-sm leading-6 text-muted-foreground">{resource.summary}</p>
        ) : null}
      </div>
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex rounded-sm text-sm font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        Open resource
      </a>
    </article>
  );
}
