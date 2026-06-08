type CalloutProps = {
  title?: string;
  children: React.ReactNode;
};

export function Callout({ title = "Note", children }: CalloutProps) {
  return (
    <aside className="not-prose rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">{title}</p>
      <div className="mt-3 text-base leading-7 text-zinc-700">{children}</div>
    </aside>
  );
}
