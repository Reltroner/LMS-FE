import { InfoIcon } from "@/components/ui/icons";

/**
 * Site-wide honesty notice. Learning accounts, progress and mentorship are previews;
 * newsletter opt-in uses the canonical Reltroner Studio service.
 */
export function PrototypeBanner() {
  return (
    <div className="border-b border-border bg-background-elevated">
      <p className="mx-auto flex max-w-[76rem] items-start gap-2 px-4 py-2 text-xs leading-5 text-muted-foreground sm:px-6 lg:px-8">
        <InfoIcon width={14} height={14} className="mt-0.5 shrink-0 text-primary" />
        <span>
          <strong className="font-semibold text-foreground">Design prototype</strong>
          {" — "}published lessons are real; account, saved progress and mentorship booking are previews.
          Newsletter sign-up is provided by Reltroner Studio. No real LMS API calls and no stored learner data.
        </span>
      </p>
    </div>
  );
}
