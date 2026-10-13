"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { mockBookings, type MentorshipBooking, type MentorshipBookingStatus } from "@/lib/fixtures/admin";

const statusTone: Record<MentorshipBookingStatus, "warning" | "success" | "danger" | "neutral"> = {
  pending: "warning",
  confirmed: "success",
  cancelled: "danger",
  completed: "neutral",
};

export function MentorshipAdministration() {
  const [bookings, setBookings] = useState<MentorshipBooking[]>(mockBookings);
  const [filter, setFilter] = useState<"all" | MentorshipBookingStatus>("all");

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const setStatus = (id: string, status: MentorshipBookingStatus) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition ${
              filter === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/30"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((b) => (
          <Card key={b.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{b.offeringTitle}</h3>
                  <Badge tone={statusTone[b.status]}>{b.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {b.learnerName} · {b.mentor}
                </p>
                <p className="text-xs text-muted-foreground">
                  {b.date} · {b.id}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {b.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => setStatus(b.id, "confirmed")}>
                      Confirm
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setStatus(b.id, "cancelled")}>
                      Decline
                    </Button>
                  </>
                )}
                {b.status === "confirmed" && (
                  <Button size="sm" variant="secondary" onClick={() => setStatus(b.id, "completed")}>
                    Mark complete
                  </Button>
                )}
                {(b.status === "confirmed" || b.status === "pending") && (
                  <Button size="sm" variant="ghost" onClick={() => setStatus(b.id, "cancelled")}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            No bookings in this state.
          </Card>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Lifecycle actions are prototype-only. Real actions go through the
        Mentorship Service and are recorded in the Audit service.
      </p>
    </div>
  );
}
