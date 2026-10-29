import { lessonImageSource } from "../content/lesson-media.ts";

// Named places for concept artwork. No slot has an approved image yet, so each renders a
// labelled design placeholder. To fill one, set `src` to a commit-pinned jsDelivr asset from an
// approved resource repository (or a file in public/) and write alt text describing that image.
export type ImageSlotId =
  | "HOME_HERO"
  | "HOME_CAUSAL_MODEL"
  | "COURSE_WOS_COVER"
  | "PATH_WOS_JOURNEY"
  | "AI_KNOWLEDGE_NETWORK"
  | "ABOUT_CREATIVE_SEED"
  | "ABOUT_TWO_DESTINATIONS"
  | "MENTORSHIP_COLLABORATION";

export type SlotMotif = "book-world" | "causal" | "journey" | "network" | "seed" | "two-worlds" | "collaboration";

export type ImageSlot = Readonly<{
  id: ImageSlotId;
  aspectRatio: "16 / 9" | "3 / 2" | "4 / 3";
  subject: string;
  motif: SlotMotif;
  src?: string;
  alt?: string;
}>;

export const imageSlots: Readonly<Record<ImageSlotId, ImageSlot>> = {
  HOME_HERO: { id: "HOME_HERO", aspectRatio: "16 / 9", motif: "book-world",
    subject: "A luminous open book becoming a connected city" },
  HOME_CAUSAL_MODEL: { id: "HOME_CAUSAL_MODEL", aspectRatio: "3 / 2", motif: "causal",
    subject: "Condition, choice, and possible effect" },
  COURSE_WOS_COVER: { id: "COURSE_WOS_COVER", aspectRatio: "16 / 9", motif: "book-world",
    subject: "An interconnected city as a worldbuilding system" },
  PATH_WOS_JOURNEY: { id: "PATH_WOS_JOURNEY", aspectRatio: "3 / 2", motif: "journey",
    subject: "An eight-stage course route" },
  AI_KNOWLEDGE_NETWORK: { id: "AI_KNOWLEDGE_NETWORK", aspectRatio: "16 / 9", motif: "network",
    subject: "Sources flowing through retrieval into a cited answer" },
  ABOUT_CREATIVE_SEED: { id: "ABOUT_CREATIVE_SEED", aspectRatio: "16 / 9", motif: "seed",
    subject: "A small idea expanding into a system" },
  ABOUT_TWO_DESTINATIONS: { id: "ABOUT_TWO_DESTINATIONS", aspectRatio: "3 / 2", motif: "two-worlds",
    subject: "Reltroner Studio and Reltroner Learning, connected" },
  MENTORSHIP_COLLABORATION: { id: "MENTORSHIP_COLLABORATION", aspectRatio: "4 / 3", motif: "collaboration",
    subject: "A collaborative review around a concept board" },
};

// Course covers by course slug; courses without one get no cover art.
export const courseCoverSlots: Readonly<Record<string, ImageSlotId>> = {
  "worldbuilding-operating-system": "COURSE_WOS_COVER",
};

// Fail closed at build time: an approved image needs a trusted source and its own alt text.
export function resolveSlot(slot: ImageSlot) {
  if (slot.src === undefined) return { ...slot, approved: false as const };
  if (!lessonImageSource(slot.src) || !slot.alt?.trim()) {
    throw new Error(`Image slot ${slot.id} needs a pinned approved source and alt text`);
  }
  return { ...slot, src: slot.src, alt: slot.alt, approved: true as const };
}

export const resolveImageSlot = (id: ImageSlotId) => resolveSlot(imageSlots[id]);
