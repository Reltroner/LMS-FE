type CalloutProps = {
  title?: string;
  children: React.ReactNode;
};

export function Callout({ title = "Note", children }: CalloutProps) {
  return (
    <aside className="not-prose rounded-2xl border border-primary/20 bg-primary/5 p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">{title}</p>
      <div className="mt-3 text-base leading-7 text-slate-700">{children}</div>
    </aside>
  );
}
