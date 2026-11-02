import { cn } from "@/lib/utils/cn";

// A real sequence (such as the order every lesson follows) shown as one numbered track: each step
// sits under a shared rule instead of in its own card. The list order carries the numbering for
// assistive technology, so the visible number is hidden from it.
export function NumberedSteps({ steps, className }: {
  steps: readonly { title: string; text: string }[];
  className?: string;
}) {
  return (
    <ol className={cn("grid gap-x-6 gap-y-8", steps.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3", className)}>
      {steps.map((step, index) => (
        <li key={step.title} className="border-t-2 border-primary/60 pt-4">
          <span aria-hidden="true" className="font-display text-sm font-semibold text-primary">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-1 font-semibold text-foreground">{step.title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
