type ExerciseBlockProps = {
  title?: string;
  children: React.ReactNode;
};

export function ExerciseBlock({ title = "Exercise", children }: ExerciseBlockProps) {
  return (
    <section className="not-prose rounded-2xl border border-zinc-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-zinc-950">{title}</h3>
      <div className="mt-3 text-base leading-7 text-zinc-700">{children}</div>
    </section>
  );
}
