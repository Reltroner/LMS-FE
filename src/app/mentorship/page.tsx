import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { StatusNotice } from "@/components/ui/StatusNotice";
import { PageHero, SectionHeading } from "@/components/marketing/PageHero";
import { ConceptImage } from "@/components/marketing/ConceptImage";

export const metadata = {
  title: "Mentorship",
  description: "Where human feedback could help a creative project, and the current availability of mentorship (not bookable yet).",
};

const topics = [
  { title: "Clarifying your world premise", text: "What is the one idea your world is really about?" },
  { title: "Reviewing constraints and dependencies", text: "Which conditions shape everything else — and which are decoration?" },
  { title: "Finding a realistic next step", text: "A next question or piece of work that fits the time you actually have." },
];

const approach = [
  "Start from the question you bring, not a fixed syllabus.",
  "Look closely at one mechanism in your world before suggesting anything new.",
  "Name what the feedback rests on, and where it is only an opinion.",
  "End with one concrete next step you choose.",
];

const notIncluded = [
  "Grading, certification, or a judgement of talent.",
  "Rewriting or finishing your work for you.",
  "Feedback on Studio canon, or on anything you have not chosen to share.",
];

export default function MentorshipPage() {
  return (
    <>
      <PageHero eyebrow="Human guidance" title="Thoughtful feedback for creative work."
        lede="Mentorship is meant to help you clarify a project, test your assumptions, and find a useful next question — alongside the lessons, not instead of them."
        aside={<ConceptImage slot="MENTORSHIP_COLLABORATION" priority />}>
        <StatusNotice title="Not bookable yet" className="mt-6">
          No mentors, sessions, prices, or time slots are published, and no request can be sent from this site.
          This page describes what mentorship would offer once a real booking service exists.
        </StatusNotice>
      </PageHero>

      <Container className="space-y-14">
        <section aria-labelledby="topics-heading">
          <SectionHeading eyebrow="Scope" id="topics-heading" title="What a session could cover" />
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {topics.map((topic) => (
              <li key={topic.title}>
                <Card className="h-full p-6">
                  <h3 className="font-semibold text-foreground">{topic.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{topic.text}</p>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground">How feedback would work</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
              {approach.map((item) => <li key={item}>{item}</li>)}
            </ol>
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground">What it is not</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
              {notIncluded.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </Card>
        </div>

        <Card tone="muted" className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-muted-foreground">
            Curious how a request would work? The preview shows each step — nothing can be submitted.
          </p>
          <ButtonLink href="/mentorship/book/" variant="secondary">Preview the request steps</ButtonLink>
        </Card>
      </Container>
    </>
  );
}
