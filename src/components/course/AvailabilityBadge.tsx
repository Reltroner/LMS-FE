import { Badge } from "@/components/ui/Badge";

// Two honest states only: a published lesson is "Available now"; everything else in the
// syllabus is "Planned" (not locked, not paywalled — it has not been written or published).
export function AvailabilityBadge({ available, label }: { available: boolean; label?: string }) {
  return (
    <Badge tone={available ? "success" : "neutral"}>
      {label ?? (available ? "Available now" : "Planned")}
    </Badge>
  );
}
