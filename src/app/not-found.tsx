import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { NotFoundHint } from "@/components/layout/NotFoundHint";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <Container className="py-16 sm:py-24">
      <p className="eyebrow">404 · Page not found</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">We couldn&apos;t find that page.</h1>
      <NotFoundHint />
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/courses/">Browse courses</ButtonLink>
        <ButtonLink href="/search/" variant="secondary">Search the academy</ButtonLink>
        <ButtonLink href="/" variant="ghost">Go home</ButtonLink>
      </div>
    </Container>
  );
}
