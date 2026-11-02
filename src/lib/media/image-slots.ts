import { lessonImageSource } from "../content/lesson-media.ts";

// Named places for concept artwork. A slot with `src` shows that approved image; one without
// renders a labelled design placeholder. To fill one, set `src` to a commit-pinned jsDelivr asset
// from an approved resource repository (or a file in public/) and write alt text describing it.
export type ImageSlotId =
  | "HOME_CAUSAL_MODEL"
  | "COURSE_WOS_COVER"
  | "PATH_WOS_JOURNEY"
  | "PATH_WOS_FEATURED_COVER"
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

// Approved artwork, pinned to one reviewed commit of the resource repository (never a branch or tag).
const resourceImage = (file: string) =>
  `https://cdn.jsdelivr.net/gh/Reltroner/lms-reltroner-resource@c62944b7f7f55cb1f401bf2279a81e5868cd47a2/images/${file}`;
// The WOS identity cover: one asset, presented by both the 16:9 course cover and the 3:2 path card.
const WOS_COVER_IMAGE = resourceImage("lms-image-3.webp");

// The official Reltroner Learning emblem (open book, city skyline, celestial elements): the logo in
// the header and footer. It is not a slot; it must still be a pinned approved asset.
export const brandEmblemSrc = resourceImage("reltroner-learning-profile-picture.webp");
if (!lessonImageSource(brandEmblemSrc)) throw new Error("The brand emblem needs a pinned approved source");

// HOME_CAUSAL_MODEL is the homepage hero: Lumenhaven, the invented city the first published lesson
// uses to teach condition, choice, and possible effect.
export const imageSlots: Readonly<Record<ImageSlotId, ImageSlot>> = {
  HOME_CAUSAL_MODEL: { id: "HOME_CAUSAL_MODEL", aspectRatio: "3 / 2", motif: "causal",
    subject: "Condition, choice, and possible effect", src: resourceImage("lms-image-1.webp"),
    alt: "A fictional memory archive illustrating how permission requirements influence a teacher's choice of learning materials." },
  COURSE_WOS_COVER: { id: "COURSE_WOS_COVER", aspectRatio: "16 / 9", motif: "book-world",
    subject: "An interconnected city as a worldbuilding system", src: WOS_COVER_IMAGE,
    alt: "An interconnected fictional city and landscape illustrating the systems behind worldbuilding." },
  PATH_WOS_JOURNEY: { id: "PATH_WOS_JOURNEY", aspectRatio: "3 / 2", motif: "journey",
    subject: "An eight-stage course route", src: resourceImage("lms-image-2.webp"),
    alt: "Eight connected stages representing the Worldbuilding Operating System learning journey." },
  PATH_WOS_FEATURED_COVER: { id: "PATH_WOS_FEATURED_COVER", aspectRatio: "3 / 2", motif: "book-world",
    subject: "The Worldbuilding Operating System cover in a featured learning-path card", src: WOS_COVER_IMAGE,
    alt: "An interconnected fictional city and landscape representing the Worldbuilding Operating System learning path." },
  AI_KNOWLEDGE_NETWORK: { id: "AI_KNOWLEDGE_NETWORK", aspectRatio: "16 / 9", motif: "network",
    subject: "Sources flowing through retrieval into a cited answer", src: resourceImage("lms-image-4.webp"),
    alt: "Published knowledge sources connected through a retrieval process to a source-linked response." },
  ABOUT_CREATIVE_SEED: { id: "ABOUT_CREATIVE_SEED", aspectRatio: "16 / 9", motif: "seed",
    subject: "A small idea expanding into a system", src: resourceImage("lms-image-5.webp"),
    alt: "A luminous creative seed developing into interconnected structures and possible directions." },
  ABOUT_TWO_DESTINATIONS: { id: "ABOUT_TWO_DESTINATIONS", aspectRatio: "3 / 2", motif: "two-worlds",
    subject: "Reltroner Studio and Reltroner Learning, connected", src: resourceImage("lms-image-6.webp"),
    alt: "A conceptual future workspace connecting creative worldbuilding with structured learning." },
  MENTORSHIP_COLLABORATION: { id: "MENTORSHIP_COLLABORATION", aspectRatio: "4 / 3", motif: "collaboration",
    subject: "A collaborative review around a concept board" },
};

// Course covers by course slug; courses without one get no cover art.
export const courseCoverSlots: Readonly<Record<string, ImageSlotId>> = {
  "worldbuilding-operating-system": "COURSE_WOS_COVER",
};

// Path-card covers by member course slug; paths without one show the generic journey art.
export const pathCoverSlots: Readonly<Record<string, ImageSlotId>> = {
  "worldbuilding-operating-system": "PATH_WOS_FEATURED_COVER",
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
