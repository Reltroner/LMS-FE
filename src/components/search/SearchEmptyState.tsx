export function SearchEmptyState() {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-primary/30 bg-primary/5 px-6 py-16 text-center shadow-[0_24px_70px_-56px_rgba(15,23,42,0.28)] sm:px-8">
      <h3 className="text-2xl font-semibold tracking-normal text-foreground">No results found.</h3>
      <p className="mx-auto mt-3 max-w-md text-base leading-7 text-muted-foreground">
        Try a broader phrase, a course topic, or one of the skill areas from the catalog.
      </p>
    </div>
  );
}
