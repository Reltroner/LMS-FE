// Newsletter capability for this LMS build. Deliberately a reviewed code constant, not an
// environment flag: an env var cannot prove that Studio accepts the LMS origin or that its WAF
// rule is active. Switch to "live" (with the Studio endpoint) only after that is verified.
export type NewsletterMode = "live" | "preview" | "unavailable";

export const newsletterIntegration: Readonly<{ mode: NewsletterMode; endpoint: string | null }> = {
  mode: "preview",
  endpoint: null,
};
