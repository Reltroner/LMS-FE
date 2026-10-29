"use client";

import { useId, useMemo, useRef, useState, type SubmitEvent } from "react";
import { createSubscriptionClient } from "@/lib/newsletter/client";
import type { NewsletterMode } from "@/lib/newsletter/config";
import { MAX_EMAIL_LENGTH, validateSubscription, type SubscriptionStatus } from "@/lib/newsletter/schema";
import { cn } from "@/lib/utils/cn";

const buttonLabels: Record<NewsletterMode, string> = {
  live: "Subscribe to Studio updates",
  preview: "Preview newsletter opt-in",
  unavailable: "Newsletter sign-up unavailable",
};

type Feedback = { status: SubscriptionStatus; message: string };

export function NewsletterForm({ mode, endpoint }: { mode: NewsletterMode; endpoint: string | null }) {
  const id = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [invalidField, setInvalidField] = useState<"email" | "consent" | null>(null);
  const [feedback, setFeedback] = useState<Feedback>({
    status: "idle",
    message: mode === "live" ? "" : mode === "preview"
      ? "Preview: this form checks your entry here only. It does not send your address or create a subscription."
      : "Newsletter sign-up is not available on this site right now. No information is collected.",
  });
  // One client per mounted form so its in-flight and hold state survive re-renders.
  const client = useMemo(() => (mode === "live" && endpoint ? createSubscriptionClient({ endpoint }) : null), [mode, endpoint]);
  const disabled = mode === "unavailable" || (mode === "live" && !client) || feedback.status === "loading";

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;
    const checked = validateSubscription({ email, consent });
    if (!checked.input) {
      setInvalidField(checked.field ?? "email");
      setFeedback({ status: "invalid", message: `${checked.error} No request was sent.` });
      (checked.field === "consent" ? consentRef : emailRef).current?.focus();
      return;
    }
    setInvalidField(null);
    if (!client) {
      setFeedback({ status: "prototype", message: "Preview only: your email and consent look valid, but nothing was sent. No subscription was created and no email will arrive." });
      return;
    }
    setFeedback({ status: "loading", message: "Sending your request to Reltroner Studio…" });
    const attempt = await client.submit(checked.input);
    setFeedback({ status: attempt.result.status, message: attempt.result.message });
  }

  const errorId = `${id}-feedback`;
  return (
    <form noValidate onSubmit={onSubmit} aria-describedby={errorId} className="min-w-0">
      <label htmlFor={`${id}-email`} className="block text-sm font-semibold text-white">Email address</label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input ref={emailRef} id={`${id}-email`} type="email" name="email" autoComplete="email" inputMode="email"
          maxLength={MAX_EMAIL_LENGTH} placeholder="you@example.com" value={email} disabled={mode === "unavailable"}
          onChange={(e) => { setEmail(e.target.value); if (invalidField === "email") setInvalidField(null); }}
          aria-invalid={invalidField === "email" || undefined}
          aria-describedby={invalidField === "email" ? errorId : undefined}
          className={cn("h-12 min-w-0 flex-1 rounded-xl border bg-white px-4 text-[#122039] placeholder:text-[#5f6f86] disabled:opacity-60",
            invalidField === "email" ? "border-[#ffb4a8] ring-2 ring-[#ffb4a8]" : "border-[#c1d5ed]")} />
        <button type="submit" disabled={disabled}
          className="h-12 shrink-0 rounded-xl bg-[#39c5ea] px-5 text-sm font-bold text-[#031e32] transition hover:bg-[#6fd6f1] disabled:cursor-not-allowed disabled:opacity-60">
          {feedback.status === "loading" ? "Sending…" : buttonLabels[mode]}
        </button>
      </div>
      <div className="mt-4 flex items-start gap-3">
        <input ref={consentRef} id={`${id}-consent`} type="checkbox" checked={consent} disabled={mode === "unavailable"}
          onChange={(e) => { setConsent(e.target.checked); if (invalidField === "consent") setInvalidField(null); }}
          aria-invalid={invalidField === "consent" || undefined}
          aria-describedby={invalidField === "consent" ? errorId : undefined}
          className="mt-1 h-4 w-4 shrink-0 accent-[#39c5ea]" />
        <label htmlFor={`${id}-consent`} className="text-sm leading-6 text-[#d1e2f3]">
          I choose to receive Reltroner Studio updates. I can unsubscribe through the link provided in future newsletters.
        </label>
      </div>
      <p id={errorId} role="status" aria-live="polite"
        className={cn("mt-3 min-h-6 text-sm leading-6", feedback.status === "invalid" || feedback.status === "network-error" || feedback.status === "quota-error"
          ? "font-semibold text-[#ffd2c9]" : "text-[#bdf0fa]")}>
        {feedback.message}
      </p>
    </form>
  );
}
