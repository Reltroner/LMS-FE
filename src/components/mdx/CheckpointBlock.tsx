type CheckpointBlockProps = {
  title?: string;
  children: React.ReactNode;
};

export function CheckpointBlock({ title = "Checkpoint", children }: CheckpointBlockProps) {
  return (
    <section className="not-prose rounded-2xl border border-zinc-300 bg-zinc-950 p-5 text-white">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-3 text-base leading-7 text-zinc-200">{children}</div>
    </section>
  );
}
