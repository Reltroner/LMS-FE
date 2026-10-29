import { validateSubscription, type SubscriptionInput, type SubscriptionResult } from "./schema.ts";

// Browser transport for the canonical Studio newsletter endpoint, ported from Reltroner Studio
// lib/newsletter/subscription.client.ts. It is NOT wired to a live endpoint: Studio's
// POST /api/newsletter accepts same-origin requests from approved hostnames only. Use this
// client only after Studio explicitly allows https://lms.reltroner.com (Origin check, OPTIONS
// preflight, narrow Access-Control-Allow-Origin, WAF/rate limits) and that change is deployed.
//
// Guarantees: at most one POST per call, never retried; a non-JSON or redirected response is
// never trusted; any unconfirmed outcome holds further submissions; no address in diagnostics.

export type SubscriptionAttempt = Readonly<{
  confirmed: boolean;
  requestSent: boolean;
  result: SubscriptionResult;
}>;

type ClientOptions = {
  endpoint: string;
  fetcher?: typeof fetch;
  now?: () => number;
  timeoutMilliseconds?: number;
};

const STATUSES = ["invalid", "prototype", "accepted", "subscribed", "duplicate", "rejected", "network-error", "quota-error"];
const CONFIRMED = ["prototype", "accepted", "subscribed", "duplicate"];
const MAX_RESPONSE_BYTES = 16_384;
const UNCERTAIN_HOLD_SECONDS = 10;
const MAX_HOLD_SECONDS = 3600;
const unconfirmed = "Your address may or may not have been saved, and no automatic retry was made.";

class Interrupted extends Error {}

const result = (status: SubscriptionResult["status"], message: string): SubscriptionResult =>
  ({ status, message, delivered: false, verified: false });

function retryAfter(value: string | null, now: number): number | null {
  const text = value?.trim() || "";
  if (!text) return null;
  const seconds = /^\d{1,7}$/.test(text) ? Number(text) : Math.ceil((Date.parse(text) - now) / 1000);
  return Number.isFinite(seconds) && seconds >= 0 ? Math.min(seconds, MAX_HOLD_SECONDS) : null;
}

export function createSubscriptionClient(options: ClientOptions) {
  const endpoint = new URL(options.endpoint);
  if (endpoint.protocol !== "https:" && endpoint.hostname !== "localhost") {
    throw new Error("Newsletter endpoint must use HTTPS");
  }
  const now = options.now ?? Date.now;
  const timeoutMilliseconds = options.timeoutMilliseconds ?? 10_000;
  let inFlight = false;
  let holdUntil = 0;
  let held: SubscriptionResult | null = null;

  const notSent = (status: SubscriptionResult["status"], message: string): SubscriptionAttempt =>
    ({ confirmed: false, requestSent: false, result: result(status, message) });

  async function submit(value: { email: string; consent: boolean }): Promise<SubscriptionAttempt> {
    const checked = validateSubscription(value);
    if (!checked.input) return notSent("invalid", checked.error!);
    if (inFlight) return notSent("loading", "A subscription request is already in progress. No additional request was sent.");
    const remaining = Math.ceil((holdUntil - now()) / 1000);
    if (held && remaining > 0) {
      return notSent(held.status, `The previous subscription request was not confirmed, so no additional request was sent. Please wait about ${remaining} seconds, then check your newsletter preferences before trying again.`);
    }
    inFlight = true;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const interrupted = new Promise<never>((_, reject) => {
      timer = setTimeout(() => { controller.abort(); reject(new Interrupted()); }, timeoutMilliseconds);
    });
    let retryAfterSeconds: number | null = null;
    let confirmed = false;
    let feedback: SubscriptionResult;
    try {
      const body: SubscriptionInput = checked.input;
      const response = await Promise.race([(options.fetcher ?? fetch)(endpoint.toString(), {
        method: "POST", mode: "cors", credentials: "omit", signal: controller.signal,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      }), interrupted]);
      const type = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() || "";
      retryAfterSeconds = retryAfter(response.headers.get("retry-after"), now());
      if (type !== "application/json" || response.redirected) {
        // Platform pages (for example an HTML 502) are never parsed or trusted as a result.
        void response.body?.cancel().catch(() => {});
        feedback = response.status === 429
          ? result("quota-error", "The newsletter request limit was reached. Subscription is not confirmed, and no automatic retry was made. Please wait before trying again.")
          : result("network-error", `Subscription status could not be confirmed: the service returned HTTP ${response.status} instead of a subscription result. ${unconfirmed}`);
      } else {
        const text = await Promise.race([response.text(), interrupted]);
        let data: unknown;
        try { data = text.length > MAX_RESPONSE_BYTES ? null : JSON.parse(text); } catch { data = null; }
        const value = data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : null;
        if (!value || typeof value.message !== "string" || typeof value.status !== "string" || !STATUSES.includes(value.status)
          || ("delivered" in value && value.delivered !== false) || ("verified" in value && value.verified !== false)
          || (!response.ok && CONFIRMED.includes(value.status))) {
          feedback = result("network-error", `Subscription status could not be confirmed: the response was not a valid subscription result (HTTP ${response.status}). ${unconfirmed}`);
        } else {
          confirmed = response.ok && CONFIRMED.includes(value.status);
          feedback = result(value.status as SubscriptionResult["status"], value.message);
        }
      }
    } catch (error) {
      const timedOut = error instanceof Interrupted || controller.signal.aborted;
      feedback = result("network-error", timedOut
        ? `Subscription status could not be confirmed before the request timed out. ${unconfirmed}`
        : `Subscription status could not be confirmed because the connection failed. ${unconfirmed}`);
    } finally {
      clearTimeout(timer);
      controller.abort();
      inFlight = false;
    }
    if (confirmed || feedback.status === "invalid") { held = null; holdUntil = 0; }
    else { held = feedback; holdUntil = now() + Math.max(retryAfterSeconds ?? 0, UNCERTAIN_HOLD_SECONDS) * 1000; }
    return { confirmed, requestSent: true, result: feedback };
  }

  return { submit };
}
