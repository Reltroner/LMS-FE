import { Suspense } from "react";
import { AssistantPage, AssistantPageFromUrl } from "@/components/assistant/AssistantPage";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SearchIcon, SparklesIcon } from "@/components/ui/icons";
import { PageHero, SectionHeading } from "@/components/marketing/PageHero";
import { ConceptImage } from "@/components/marketing/ConceptImage";
import { FlowSteps } from "@/components/learning/FlowSteps";

export const metadata = {
  title: "AI Guide",
  description: "Ask questions about published lessons. The Reltroner Learning Guide shows the passages it relies on.",
};

const serviceConfigured = Boolean(process.env.NEXT_PUBLIC_KNOWLEDGE_SERVICE_URL);

const canHelp = [
  "Find where a concept is explained in published lessons.",
  "Show the exact passages behind an explanation, with links.",
  "Suggest a sensible next lesson or question to explore.",
];
const cannotVerify = [
  "Facts about the real world that the lessons do not cover.",
  "Whether a fictional pattern fits your real situation — that needs real information.",
  "Your progress, enrolment, or bookings; it cannot see or change them.",
  "Unpublished or planned lessons; they are not in its sources.",
];

export default function AIGuidePage() {
  return (
    <>
      <PageHero
        eyebrow="Source-grounded learning"
        title="Ask questions. Explore the reasoning. Follow the source."
        lede="The Reltroner Learning Guide answers from published lesson material and shows the passages it relies on, so you can check every explanation yourself."
        actions={
          <>
            <ButtonLink href="#guide-chat" size="lg"><SparklesIcon width={18} height={18} /> Try a question</ButtonLink>
            <ButtonLink href="/search/" variant="secondary" size="lg"><SearchIcon width={18} height={18} /> Explore sources</ButtonLink>
          </>
        }
        aside={<ConceptImage slot="AI_KNOWLEDGE_NETWORK" priority />}
      >
        <p className="mt-6 inline-flex rounded-full border border-primary/25 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          {serviceConfigured ? "Status: connected to the knowledge service" : "Status: source-excerpt mode — no AI model is connected"}
        </p>
      </PageHero>

      <Container size="md">
        <Suspense fallback={<AssistantPage />}>
          <AssistantPageFromUrl />
        </Suspense>
      </Container>

      <Container className="mt-16 space-y-12">
        <section aria-labelledby="how-heading">
          <SectionHeading eyebrow="How it works" id="how-heading" title="Published content in, cited passages out"
            lede="Retrieval always runs. Writing an explanation needs an authorized AI model; without one, you see the passages themselves, labelled as excerpts." />
          <FlowSteps className="mt-6" label="How the guide answers" steps={[
            { title: "Published lessons", detail: "Only reviewed, public material is indexed." },
            { title: "Retrieve", detail: "Find the passages that match your question." },
            { title: "Explain", detail: "Only when an AI model is connected." },
            { title: "Cite", detail: "Link every answer to its source." },
          ]} />
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground">What it can help with</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
              {canHelp.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </Card>
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground">What it cannot verify</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
              {cannotVerify.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </Card>
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground">Privacy and status</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {serviceConfigured
                ? "Your questions are sent to the Reltroner knowledge service to find passages. Conversations are not saved on this site."
                : "Your questions are matched against the published lessons inside your browser; nothing is sent to a server, and conversations are not saved."}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The guide supports learning; it does not certify understanding or competence.
            </p>
          </Card>
        </div>
      </Container>
    </>
  );
}
