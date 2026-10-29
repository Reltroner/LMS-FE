import { AdminNav } from "@/components/admin/AdminNav";

// Constrained console layout. The shared newsletter and footer render once, after this
// workspace, from the root layout — never inside it.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[76rem] px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="md:sticky md:top-20 md:self-start" aria-label="Administration sections">
          <p className="px-3 text-sm font-semibold text-foreground">Administration</p>
          <p className="mb-3 px-3 text-xs text-muted-foreground">Requires authorized roles</p>
          <AdminNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
