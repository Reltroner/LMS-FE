import { Container } from "@/components/ui/Container";
import { site } from "@/lib/seo/site";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <Container className="py-6 text-sm text-zinc-500">{site.name}</Container>
    </footer>
  );
}
