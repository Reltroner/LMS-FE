import { InfoIcon } from "@/components/ui/icons";

/**
 * Prototype-only banner. Clearly marks the UI as a design prototype, not
 * production. Per frozen architecture: no durable state is owned here.
 */
export function PrototypeBanner() {
  return (
    <div className="border-b border-border bg-background-elevated">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 text-xs text-muted-foreground sm:px-6 lg:px-8">
        <InfoIcon width={14} height={14} className="text-primary" />
        <span>
          <strong className="font-semibold text-foreground">Design prototype</strong>
          {" — "}
          local mock fixtures only. No real LMS API calls, no durable learner state,
          and no production authorization. Authentication is owned by
          <code className="mx-1 rounded bg-card px-1.5 py-0.5 font-mono text-[11px]">
            auth.reltroner.com
          </code>
          (Keycloak OIDC).
        </span>
      </div>
    </div>
  );
}
