export function CourseEmptyState() {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center shadow-[0_24px_70px_-56px_rgba(24,24,27,0.25)] sm:px-8">
      <h3 className="text-2xl font-semibold tracking-normal text-zinc-950">No courses found.</h3>
      <p className="mt-3 text-base leading-7 text-zinc-600">Try adjusting your filters.</p>
    </div>
  );
}
