"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  mockPrincipals,
  type Principal,
  type PrincipalRole,
} from "@/lib/fixtures/admin";
import { cn } from "@/lib/utils/cn";

const roleTone = {
  admin: "danger",
  mentor: "accent",
  instructor: "primary",
  learner: "neutral",
} as const;

const statusTone = {
  active: "success",
  suspended: "danger",
  invited: "neutral",
} as const;

export function PrincipalManagement() {
  const [principals, setPrincipals] = useState<Principal[]>(mockPrincipals);
  const [selected, setSelected] = useState<Principal | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  const updateRole = (id: string, role: PrincipalRole) => {
    setPrincipals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, role } : p)),
    );
    setSelected((s) => (s && s.id === id ? { ...s, role } : s));
    setShowRoleDialog(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      {/* List */}
      <Card className="overflow-hidden">
        <div className="border-b border-border p-4">
          <h2 className="font-semibold text-foreground">Principals</h2>
          <p className="text-xs text-muted-foreground">
            {principals.length} accounts (mock data)
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background-elevated/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 hidden sm:table-cell">Last active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {principals.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={cn(
                    "cursor-pointer transition hover:bg-primary/5",
                    selected?.id === p.id && "bg-primary/5",
                  )}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={roleTone[p.role]}>{p.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[p.status]}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden text-muted-foreground sm:table-cell">
                    {new Date(p.lastActive).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail panel */}
      <div className="space-y-4">
        <Card className="p-5">
          <h3 className="font-semibold text-foreground">Principal details</h3>
          {selected ? (
            <div className="mt-4 space-y-3 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {selected.name}</p>
              <p><span className="text-muted-foreground">Email:</span> {selected.email}</p>
              <p><span className="text-muted-foreground">Role:</span> <Badge tone={roleTone[selected.role]}>{selected.role}</Badge></p>
              <p><span className="text-muted-foreground">Status:</span> <Badge tone={statusTone[selected.status]}>{selected.status}</Badge></p>
              <p className="text-xs text-muted-foreground">
                Created {new Date(selected.createdAt).toLocaleDateString()}
              </p>

              <div className="border-t border-border pt-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Role management</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => setShowRoleDialog(true)}
                >
                  Change role
                </Button>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Prototype interaction. Real role changes are authorized by the
                  Gateway and audited.
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Select a principal to view details.
            </p>
          )}
        </Card>
      </div>

      {/* Role dialog */}
      {showRoleDialog && selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowRoleDialog(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Change principal role"
        >
          <Card className="w-full max-w-md p-6" >
            <h3 className="text-lg font-semibold text-foreground">Change role</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Update the role for <strong>{selected.name}</strong>.
            </p>
            <div className="mt-4 space-y-2">
              {(["learner", "instructor", "mentor", "admin"] as PrincipalRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => updateRole(selected.id, r)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border p-3 text-left transition",
                    selected.role === r
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30",
                  )}
                >
                  <span className="font-medium capitalize text-foreground">{r}</span>
                  <Badge tone={roleTone[r]}>{r}</Badge>
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              This action is simulated. In production it would be authorized and
              emit an audit event.
            </p>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={() => setShowRoleDialog(false)}>Cancel</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
