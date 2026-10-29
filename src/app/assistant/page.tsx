import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const metadata = {
  title: "AI Guide",
  robots: { index: false },
  alternates: { canonical: "/ai/" },
};

// Legacy route: the assistant now lives at /ai/. A static export cannot send an HTTP redirect, and
// next/navigation's redirect() only reaches visitors once JavaScript runs, so the page carries a
// meta refresh (React hoists it into <head>) plus a visible link.
export default function AssistantRoute() {
  return (
    <Container className="py-16 sm:py-24">
      <meta httpEquiv="refresh" content="0;url=/ai/" />
      <p className="eyebrow">Moved</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">The learning assistant is now the AI Guide.</h1>
      <p className="mt-4 text-base text-muted-foreground">
        Taking you there now. If nothing happens, <Link href="/ai/" className="font-semibold text-primary underline underline-offset-2">open the AI Guide</Link>.
      </p>
    </Container>
  );
}
