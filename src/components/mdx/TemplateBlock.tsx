import { ResourceCard } from "@/components/resource/ResourceCard";

type TemplateBlockProps = {
  resourceId: string;
};

export function TemplateBlock({ resourceId }: TemplateBlockProps) {
  return <ResourceCard resourceId={resourceId} />;
}
