type CheckpointBlockProps = {
  title?: string;
  children: React.ReactNode;
};

export function CheckpointBlock({ title = "Checkpoint", children }: CheckpointBlockProps) {
  return (
    <section className="not-prose rounded-2xl border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_16px_50px_-30px_rgba(15,23,42,0.8)]">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-3 text-base leading-7 text-slate-200">{children}</div>
    </section>
  );
}
