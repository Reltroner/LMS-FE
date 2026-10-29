"use client";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

// Recoverable page error: announced to screen readers, no internal details shown.
export default function PageError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <Container className="py-16 sm:py-24">
      <div role="alert">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">This page didn&apos;t load properly.</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          This is usually temporary. Try loading the page again; if it keeps happening, start again from the home page.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()}
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Try again
        </button>
        <ButtonLink href="/" variant="secondary">Go home</ButtonLink>
      </div>
    </Container>
  );
}
