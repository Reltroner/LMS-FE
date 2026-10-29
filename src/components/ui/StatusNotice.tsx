import type { ReactNode } from "react";
import { InfoIcon } from "./icons";
import { cn } from "@/lib/utils/cn";

// States plainly what a page can and cannot do yet (preview, not connected, unavailable).
export function StatusNotice({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div role="note" className={cn("flex gap-3 rounded-2xl border-l-4 border-primary bg-background-elevated p-4 sm:p-5", className)}>
      <InfoIcon width={18} height={18} className="mt-0.5 shrink-0 text-primary" />
      <div className="text-sm leading-6">
        <p className="font-semibold text-foreground">{title}</p>
        <div className="mt-1 text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
