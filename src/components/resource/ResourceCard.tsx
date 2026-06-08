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
        <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
          Resource unavailable: {resourceId}
        </p>
      </div>
    );
  }

  return (
    <article
      className={`rounded-2xl border border-zinc-200 bg-zinc-50 p-5 ${className ?? ""}`.trim()}
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          {resource.type}
        </p>
        <h3 className="text-xl font-semibold text-zinc-950">{resource.title}</h3>
        {resource.summary ? (
          <p className="text-sm leading-6 text-zinc-600">{resource.summary}</p>
        ) : null}
      </div>
      <a
        href={resource.url}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex rounded-sm text-sm font-semibold text-zinc-950 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-700"
      >
        Open resource
      </a>
    </article>
  );
}
