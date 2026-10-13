"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
} from "@/components/ui/icons";
import {
  getOffering,
  mentorshipOfferings,
  mentorshipSlots,
} from "@/lib/fixtures/mentorship";
import { cn } from "@/lib/utils/cn";

type Step = "offering" | "availability" | "review" | "confirmation" | "status";

const steps: { key: Step; label: string }[] = [
  { key: "offering", label: "Offering" },
  { key: "availability", label: "Availability" },
  { key: "review", label: "Review" },
  { key: "confirmation", label: "Confirmation" },
  { key: "status", label: "Status" },
];

export function BookingJourney() {
  const searchParams = useSearchParams();
  const initialOffering = searchParams.get("offering") ?? undefined;
  const [step, setStep] = useState<Step>("offering");
  const [offeringId, setOfferingId] = useState<string | undefined>(initialOffering);
  const [slotId, setSlotId] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState("");

  const offering = useMemo(
    () => (offeringId ? getOffering(offeringId) : undefined),
    [offeringId],
  );
  const slot = useMemo(
    () => mentorshipSlots.find((s) => s.id === slotId),
    [slotId],
  );

  const stepIndex = steps.findIndex((s) => s.key === step);

  const reset = () => {
    setStep("offering");
    setOfferingId(undefined);
    setSlotId(undefined);
    setNotes("");
  };

  return (
    <Section className="pt-4">
      <Container size="md">
        {/* Stepper */}
        <nav aria-label="Booking progress" className="mb-8">
          <ol className="flex flex-wrap items-center gap-2">
            {steps.map((s, i) => (
              <li key={s.key} className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition",
                    i <= stepIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-background-elevated text-muted-foreground",
                  )}
                  aria-current={i === stepIndex ? "step" : undefined}
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-sm sm:inline",
                    i === stepIndex ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <span className="mx-1 hidden h-px w-6 bg-border sm:block" />
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Step content */}
        <Card className="p-6 sm:p-8">
          {step === "offering" && (
            <div>
              <Heading level={2}>Select an offering</Heading>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose the mentorship session you want to book.
              </p>
              <div className="mt-6 space-y-3">
                {mentorshipOfferings.filter((o) => o.status !== "coming-soon").map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setOfferingId(o.id)}
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left transition",
                      offeringId === o.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/30",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-foreground">{o.title}</h3>
                      <Badge tone={o.status === "available" ? "success" : "warning"}>
                        {o.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{o.summary}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><ClockIcon width={12} height={12} />{o.duration}</span>
                      <span className="flex items-center gap-1"><UsersIcon width={12} height={12} />{o.format}</span>
                      <span className="flex items-center gap-1"><CalendarIcon width={12} height={12} />Next: {o.nextAvailable}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => offering && setStep("availability")} disabled={!offering}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === "availability" && (
            <div>
              <Heading level={2}>Choose a time</Heading>
              <p className="mt-2 text-sm text-muted-foreground">
                {offering?.title} — select an available slot.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {mentorshipSlots.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setSlotId(s.id)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition",
                      !s.available && "cursor-not-allowed opacity-50",
                      slotId === s.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : s.available && "border-border hover:border-primary/30",
                    )}
                  >
                    <p className="font-semibold text-foreground">{s.date}</p>
                    <p className="text-sm text-muted-foreground">{s.time} UTC</p>
                    <p className="mt-1 text-xs">
                      {s.available ? "Available" : "Booked"}
                    </p>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={() => setStep("offering")}>Back</Button>
                <Button onClick={() => slot && setStep("review")} disabled={!slot}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === "review" && (
            <div>
              <Heading level={2}>Review booking</Heading>
              <div className="mt-6 space-y-4 rounded-2xl border border-border p-5">
                <ReviewRow label="Offering" value={offering?.title ?? ""} />
                <ReviewRow label="Mentor" value={offering?.mentor ?? ""} />
                <ReviewRow label="Format" value={offering?.format ?? ""} />
                <ReviewRow label="Duration" value={offering?.duration ?? ""} />
                <ReviewRow label="Date" value={slot ? `${slot.date} at ${slot.time} UTC` : ""} />
              </div>
              <div className="mt-6">
                <label htmlFor="notes" className="text-sm font-medium text-foreground">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-border bg-card p-4 text-foreground focus:border-primary focus:ring-2 focus:ring-ring/30 focus:outline-none"
                  placeholder="Anything the mentor should know?"
                />
              </div>
              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={() => setStep("availability")}>Back</Button>
                <Button onClick={() => setStep("confirmation")}>Confirm booking</Button>
              </div>
            </div>
          )}

          {step === "confirmation" && (
            <div className="text-center py-6">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircleIcon width={32} height={32} />
              </span>
              <Heading level={2} className="mt-4">Booking confirmed</Heading>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                This is a prototype confirmation. No backend mutation occurred.
                In production, the Mentorship Service would create the booking
                and emit an audit event.
              </p>
              <div className="mx-auto mt-6 max-w-md rounded-2xl border border-border p-5 text-left">
                <ReviewRow label="Booking ref" value="BK-PROTO-0001" />
                <ReviewRow label="Offering" value={offering?.title ?? ""} />
                <ReviewRow label="Date" value={slot ? `${slot.date} ${slot.time} UTC` : ""} />
                <ReviewRow label="Status" value="Confirmed (prototype)" />
              </div>
              <div className="mt-6 flex justify-center gap-3">
                <Button variant="secondary" onClick={reset}>Book another</Button>
                <Button onClick={() => setStep("status")}>View status</Button>
              </div>
            </div>
          )}

          {step === "status" && (
            <div>
              <Heading level={2}>Booking status</Heading>
              <p className="mt-2 text-sm text-muted-foreground">
                Track the lifecycle of your prototype booking.
              </p>
              <Card className="mt-6 border-primary/20 p-6">
                <div className="flex items-center gap-3">
                  <Badge tone="success">Confirmed</Badge>
                  <span className="text-sm text-muted-foreground">BK-PROTO-0001</span>
                </div>
                <h3 className="mt-3 font-semibold text-foreground">{offering?.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {slot?.date} at {slot?.time} UTC · {offering?.format}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm">Reschedule (prototype)</Button>
                  <Button variant="danger" size="sm">Cancel (prototype)</Button>
                </div>
              </Card>
              <div className="mt-6 flex justify-end">
                <Button variant="ghost" onClick={reset}>Start over</Button>
              </div>
            </div>
          )}
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          All booking interactions are prototype-only. No state is persisted.
        </p>
      </Container>
    </Section>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value || "—"}</span>
    </div>
  );
}
