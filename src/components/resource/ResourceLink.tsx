import { getResourceById } from "@/lib/resource/resource-registry";

type ResourceLinkProps = {
  resourceId: string;
  children?: React.ReactNode;
  className?: string;
};

export function ResourceLink({ resourceId, children, className }: ResourceLinkProps) {
  const resource = getResourceById(resourceId);

  if (!resource) {
    return <span className={className}>Resource unavailable: {resourceId}</span>;
  }

  return (
    <a href={resource.url} target="_blank" rel="noreferrer" className={className}>
      {children ?? resource.title}
    </a>
  );
}
