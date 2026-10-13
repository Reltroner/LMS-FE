"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { mockAuditEvents, type AuditEvent } from "@/lib/fixtures/admin";
import { cn } from "@/lib/utils/cn";

const resultTone = {
  success: "success",
  failure: "danger",
  denied: "warning",
} as const;

export function AuditExplorer() {
  const [query, setQuery] = useState("");
  const [service, setService] = useState<string>("all");
  const [selected, setSelected] = useState<AuditEvent | null>(null);

  const services = useMemo(
    () => ["all", ...Array.from(new Set(mockAuditEvents.map((e) => e.service)))],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mockAuditEvents.filter((e) => {
      if (service !== "all" && e.service !== service) return false;
      if (!q) return true;
      return `${e.action} ${e.actor} ${e.resource} ${e.details}`.toLowerCase().includes(q);
    });
  }, [query, service]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      {/* Table */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events by action, actor, resource…"
            aria-label="Search audit events"
            className="flex-1"
          />
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="h-12 rounded-full border border-border bg-card px-5 text-foreground focus:border-primary focus:outline-none"
            aria-label="Filter by service"
          >
            {services.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All services" : s}</option>
            ))}
          </select>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background-elevated/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3 hidden md:table-cell">Service</th>
                  <th className="px-4 py-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((e) => (
                  <tr
                    key={e.id}
                    onClick={() => setSelected(e)}
                    className={cn(
                      "cursor-pointer transition hover:bg-primary/5",
                      selected?.id === e.id && "bg-primary/5",
                    )}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                      {new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{e.action}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.actor}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{e.service}</td>
                    <td className="px-4 py-3">
                      <Badge tone={resultTone[e.result]}>{e.result}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No events match your filters.
            </div>
          )}
        </Card>

        <p className="text-xs text-muted-foreground">
          Audit events are append-only and owned by the Audit Service. This
          explorer is a prototype read view.
        </p>
      </div>

      {/* Detail panel */}
      <Card className="h-fit p-5">
        <h3 className="font-semibold text-foreground">Event detail</h3>
        {selected ? (
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Event ID</dt>
              <dd className="font-mono text-xs text-foreground">{selected.id}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Timestamp</dt>
              <dd className="text-foreground">{new Date(selected.timestamp).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Actor</dt>
              <dd className="text-foreground">{selected.actor}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Action</dt>
              <dd className="text-foreground">{selected.action}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Resource</dt>
              <dd className="font-mono text-xs text-foreground break-all">{selected.resource}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Service</dt>
              <dd><Badge tone="neutral">{selected.service}</Badge></dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Result</dt>
              <dd><Badge tone={resultTone[selected.result]}>{selected.result}</Badge></dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Details</dt>
              <dd className="text-foreground">{selected.details}</dd>
            </div>
            <div className="border-t border-border pt-3">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Provenance</dt>
              <dd className="text-xs text-muted-foreground">
                Recorded by the Audit Service via the event bus. Append-only;
                not mutable from this interface.
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Select an event to inspect its provenance and details.
          </p>
        )}
      </Card>
    </div>
  );
}
