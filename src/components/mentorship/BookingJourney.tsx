import { Card } from "@/components/ui/Card";
import { StatusNotice } from "@/components/ui/StatusNotice";

const steps = [
  { title: "Context", text: "Describe your project and what you would like to work through." },
  { title: "Review", text: "Check what will be shared and confirm your consent." },
  { title: "Confirmation", text: "Receive a verifiable confirmation from the booking service." },
];

// Preview of the request flow. Every field is disabled because no booking service exists: no
// availability is shown, nothing is submitted, and no confirmation can be produced.
export function BookingJourney() {
  return (
    <div className="space-y-6">
      <StatusNotice title="Booking is not connected">
        This is a preview of the steps only. The fields are disabled, nothing you see here is sent or saved, and no
        session is reserved.
      </StatusNotice>

      <ol className="grid gap-3 sm:grid-cols-3" aria-label="Request steps">
        {steps.map((step, index) => (
          <li key={step.title} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-bold text-primary">Step {index + 1}</p>
            <p className="mt-1 font-semibold text-foreground">{step.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.text}</p>
          </li>
        ))}
      </ol>

      <Card className="p-6">
        <form aria-label="Mentorship request (preview, disabled)" className="grid gap-4 sm:grid-cols-2">
          <fieldset disabled className="contents">
            <label className="block text-sm font-medium text-foreground">
              Project or topic
              <input type="text" className="mt-1 h-11 w-full rounded-xl border border-border bg-background-elevated px-3 text-sm disabled:cursor-not-allowed" />
            </label>
            <label className="block text-sm font-medium text-foreground">
              Desired outcome
              <input type="text" className="mt-1 h-11 w-full rounded-xl border border-border bg-background-elevated px-3 text-sm disabled:cursor-not-allowed" />
            </label>
            <button type="submit" className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground opacity-60 disabled:cursor-not-allowed sm:col-span-2 sm:w-fit">
              Send request (unavailable)
            </button>
          </fieldset>
        </form>
      </Card>
    </div>
  );
}
