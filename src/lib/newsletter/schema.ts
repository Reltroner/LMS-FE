// Mirrors Reltroner Studio lib/newsletter/schema.ts so the LMS form accepts and rejects exactly
// what the canonical Studio endpoint does. Studio remains the only subscriber source of truth.
export type SubscriptionStatus =
  | "idle" | "loading" | "invalid" | "prototype" | "accepted" | "subscribed" | "duplicate"
  | "rejected" | "network-error" | "quota-error";

export type SubscriptionInput = Readonly<{ email: string; consent: true }>;

export type SubscriptionResult = Readonly<{
  status: SubscriptionStatus;
  message: string;
  delivered: false;
  verified: false;
}>;

export const MAX_EMAIL_LENGTH = 254;

export function validateSubscription(value: unknown): { input?: SubscriptionInput; error?: string; field?: "email" | "consent" } {
  if (!value || typeof value !== "object") return { error: "Please enter your email address.", field: "email" };
  const data = value as Record<string, unknown>;
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  if (!email) return { error: "Please enter your email address.", field: "email" };
  if (email.length > MAX_EMAIL_LENGTH || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address.", field: "email" };
  }
  if (data.consent !== true) return { error: "Please confirm that you'd like to receive Studio updates.", field: "consent" };
  return { input: { email, consent: true } };
}
