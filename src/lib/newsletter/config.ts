// Canonical newsletter lives at Reltroner Studio. LMS is a second consent form, not a
// separate subscriber database, Resend provider, or serverless API. Deploy the Studio origin-
// allowlist/CORS change before releasing this static LMS build to the production hostname.
// Cross-origin Studio requests omit credentials; only https://lms.reltroner.com is approved.
export type NewsletterMode = "live" | "preview" | "unavailable";

export const newsletterIntegration: Readonly<{ mode: NewsletterMode; endpoint: string | null }> = {
  mode: "live",
  endpoint: "https://www.reltroner.com/api/newsletter",
};
