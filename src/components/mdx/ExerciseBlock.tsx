type ExerciseBlockProps = {
  title?: string;
  children: React.ReactNode;
};

export function ExerciseBlock({ title = "Exercise", children }: ExerciseBlockProps) {
  return (
    <section className="not-prose rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="mt-3 text-base leading-7 text-slate-700">{children}</div>
    </section>
  );
}
