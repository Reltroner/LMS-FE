import { Fragment } from "react";
import { cn } from "@/lib/utils/cn";

// A short left-to-right (top-to-bottom on narrow screens) sequence such as
// Condition → Choice → Possible effect. Read as an ordered list by assistive technology.
export function FlowSteps({ steps, label, className }: {
  steps: readonly { title: string; detail?: string }[];
  label: string;
  className?: string;
}) {
  return (
    <ol aria-label={label} className={cn("flex flex-col items-stretch gap-2 sm:flex-row sm:items-center", className)}>
      {steps.map((step, i) => (
        <Fragment key={step.title}>
          {i > 0 && (
            <li aria-hidden="true" className="self-center text-xl text-muted-foreground sm:text-2xl">
              <span className="inline-block rotate-90 sm:rotate-0">→</span>
            </li>
          )}
          <li className="surface-midnight flex-1 rounded-2xl px-4 py-4 text-center">
            <span className="block font-semibold">{step.title}</span>
            {step.detail && <span className="mt-1 block text-sm leading-6 text-[#c3daf5]">{step.detail}</span>}
          </li>
        </Fragment>
      ))}
    </ol>
  );
}
