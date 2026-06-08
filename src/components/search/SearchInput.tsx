"use client";

type SearchInputProps = {
  query: string;
  onQueryChange?: (query: string) => void;
  isPending?: boolean;
  disabled?: boolean;
  inputId?: string;
};

export function SearchInput({
  query,
  onQueryChange,
  isPending = false,
  disabled = false,
  inputId = "academy-search",
}: SearchInputProps) {
  return (
    <form
      role="search"
      aria-label="Search courses and lessons"
      onSubmit={(event) => event.preventDefault()}
      className="space-y-4 rounded-[2rem] border border-border bg-card p-6 shadow-[0_24px_70px_-56px_rgba(15,23,42,0.28)] sm:p-8"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Frontend search
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal text-foreground">
            Search the academy
          </h2>
        </div>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {disabled
            ? "Preparing search..."
            : isPending
              ? "Updating results..."
              : "Static-friendly index"}
        </p>
      </div>
      <div className="space-y-3">
        <label htmlFor={inputId} className="sr-only">
          Search courses and lessons
        </label>
        <input
          id={inputId}
          type="search"
          value={query}
          disabled={disabled}
          autoComplete="off"
          enterKeyHint="search"
          placeholder="Search courses and lessons"
          onChange={
            onQueryChange
              ? (event) => {
                  onQueryChange(event.target.value);
                }
              : undefined
          }
          className="w-full rounded-2xl border border-border bg-background px-4 py-4 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-70"
        />
        <p className="text-sm leading-6 text-muted-foreground">
          Find courses, lessons, and paths by title, summary, or learner outcome.
        </p>
      </div>
    </form>
  );
}
