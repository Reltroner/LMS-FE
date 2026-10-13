export type MentorshipFormat = "1:1 live" | "group live" | "async review";
export type MentorshipStatus = "available" | "limited" | "coming-soon";

export type MentorshipOffering = {
  id: string;
  title: string;
  mentor: string;
  summary: string;
  format: MentorshipFormat;
  duration: string;
  level: "beginner" | "intermediate" | "advanced" | "all levels";
  priceLabel: string; // illustrative only, not a real price
  status: MentorshipStatus;
  tags: string[];
  nextAvailable: string; // deterministic date label
  capacity: string;
};

export type TimeSlot = {
  id: string;
  date: string; // deterministic
  time: string;
  available: boolean;
};

export const mentorshipOfferings: MentorshipOffering[] = [
  {
    id: "off_001",
    title: "Backend Architecture Review",
    mentor: "Jordan Patel",
    summary:
      "A focused review of your system design, API boundaries, and service decomposition decisions.",
    format: "1:1 live",
    duration: "60 min",
    level: "intermediate",
    priceLabel: "Conceptual — see pricing policy",
    status: "available",
    tags: ["architecture", "API design", "review"],
    nextAvailable: "2026-10-14",
    capacity: "3 slots / week",
  },
  {
    id: "off_002",
    title: "Worldbuilding Sprint",
    mentor: "Sage Okafor",
    summary:
      "Guided session to shape a worldbuilding premise, constraints, and a first delivery milestone.",
    format: "1:1 live",
    duration: "90 min",
    level: "all levels",
    priceLabel: "Conceptual — see pricing policy",
    status: "limited",
    tags: ["worldbuilding", "creative systems"],
    nextAvailable: "2026-10-18",
    capacity: "1 slot / week",
  },
  {
    id: "off_003",
    title: "Code Review Clinic",
    mentor: "Team (rotating)",
    summary:
      "Group session covering common code review pitfalls, feedback strategies, and quality bars.",
    format: "group live",
    duration: "45 min",
    level: "beginner",
    priceLabel: "Conceptual — see pricing policy",
    status: "available",
    tags: ["code review", "quality", "group"],
    nextAvailable: "2026-10-12",
    capacity: "8 seats",
  },
  {
    id: "off_004",
    title: "Async Project Submission",
    mentor: "Review queue",
    summary:
      "Submit a project artifact for asynchronous written feedback within two business days.",
    format: "async review",
    duration: "async",
    level: "all levels",
    priceLabel: "Conceptual — see pricing policy",
    status: "coming-soon",
    tags: ["async", "project", "feedback"],
    nextAvailable: "2026-11-01",
    capacity: "Queue limited",
  },
];

export const mentorshipSlots: TimeSlot[] = [
  { id: "s1", date: "2026-10-14", time: "10:00", available: true },
  { id: "s2", date: "2026-10-14", time: "13:00", available: false },
  { id: "s3", date: "2026-10-14", time: "16:00", available: true },
  { id: "s4", date: "2026-10-15", time: "09:00", available: true },
  { id: "s5", date: "2026-10-15", time: "14:00", available: true },
  { id: "s6", date: "2026-10-15", time: "17:30", available: false },
];

export function getOffering(id: string) {
  return mentorshipOfferings.find((o) => o.id === id);
}
