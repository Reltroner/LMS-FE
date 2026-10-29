import { InfoIcon } from "@/components/ui/icons";

/**
 * Site-wide honesty notice. Published lessons are real; account, progress, booking and
 * newsletter features are previews until their services are connected and approved.
 */
export function PrototypeBanner() {
  return (
    <div className="border-b border-border bg-background-elevated">
      <p className="mx-auto flex max-w-[76rem] items-start gap-2 px-4 py-2 text-xs leading-5 text-muted-foreground sm:px-6 lg:px-8">
        <InfoIcon width={14} height={14} className="mt-0.5 shrink-0 text-primary" />
        <span>
          <strong className="font-semibold text-foreground">Design prototype</strong>
          {" — "}published lessons are real; sign-in, saved progress, mentorship booking and newsletter
          sign-up are previews. No real LMS API calls and no stored learner data.
        </span>
      </p>
    </div>
  );
}
