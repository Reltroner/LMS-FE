export type PrincipalRole = "admin" | "mentor" | "instructor" | "learner";
export type PrincipalStatus = "active" | "suspended" | "invited";

export type Principal = {
  id: string;
  name: string;
  email: string;
  role: PrincipalRole;
  status: PrincipalStatus;
  createdAt: string;
  lastActive: string;
};

export type MentorshipBookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type MentorshipBooking = {
  id: string;
  learnerName: string;
  offeringTitle: string;
  mentor: string;
  date: string;
  status: MentorshipBookingStatus;
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  service: string;
  result: "success" | "failure" | "denied";
  details: string;
};

export const mockPrincipals: Principal[] = [
  {
    id: "p001",
    name: "Alex Rivera",
    email: "alex.rivera@example.com",
    role: "learner",
    status: "active",
    createdAt: "2026-01-15T09:00:00.000Z",
    lastActive: "2026-10-09T14:30:00.000Z",
  },
  {
    id: "p002",
    name: "Jordan Patel",
    email: "jordan.patel@example.com",
    role: "mentor",
    status: "active",
    createdAt: "2026-02-01T09:00:00.000Z",
    lastActive: "2026-10-09T10:00:00.000Z",
  },
  {
    id: "p003",
    name: "Sage Okafor",
    email: "sage.okafor@example.com",
    role: "mentor",
    status: "active",
    createdAt: "2026-02-15T09:00:00.000Z",
    lastActive: "2026-10-08T16:00:00.000Z",
  },
  {
    id: "p004",
    name: "Morgan Lee",
    email: "morgan.lee@example.com",
    role: "instructor",
    status: "active",
    createdAt: "2026-03-01T09:00:00.000Z",
    lastActive: "2026-10-07T11:00:00.000Z",
  },
  {
    id: "p005",
    name: "Casey Kim",
    email: "casey.kim@example.com",
    role: "admin",
    status: "active",
    createdAt: "2026-01-01T09:00:00.000Z",
    lastActive: "2026-10-09T08:00:00.000Z",
  },
  {
    id: "p006",
    name: "Riley Chen",
    email: "riley.chen@example.com",
    role: "learner",
    status: "suspended",
    createdAt: "2026-04-10T09:00:00.000Z",
    lastActive: "2026-09-20T14:00:00.000Z",
  },
];

export const mockBookings: MentorshipBooking[] = [
  {
    id: "BK-1001",
    learnerName: "Alex Rivera",
    offeringTitle: "Systemic World Architecture Review",
    mentor: "Jordan Patel",
    date: "2026-10-14 10:00 UTC",
    status: "pending",
    createdAt: "2026-10-09T14:30:00.000Z",
  },
  {
    id: "BK-1002",
    learnerName: "Taylor Brooks",
    offeringTitle: "Worldbuilding Sprint",
    mentor: "Sage Okafor",
    date: "2026-10-18 09:00 UTC",
    status: "confirmed",
    createdAt: "2026-10-08T11:00:00.000Z",
  },
  {
    id: "BK-1003",
    learnerName: "Drew Hayes",
    offeringTitle: "Creative Constraints Clinic",
    mentor: "Team (rotating)",
    date: "2026-10-12 14:00 UTC",
    status: "confirmed",
    createdAt: "2026-10-07T09:00:00.000Z",
  },
  {
    id: "BK-1004",
    learnerName: "Quinn West",
    offeringTitle: "Systemic World Architecture Review",
    mentor: "Jordan Patel",
    date: "2026-10-10 13:00 UTC",
    status: "cancelled",
    createdAt: "2026-10-05T10:00:00.000Z",
  },
];

export const mockAuditEvents: AuditEvent[] = [
  {
    id: "e1",
    timestamp: "2026-10-09T14:32:11.000Z",
    actor: "alex.rivera@example.com",
    action: "lesson.viewed",
    resource: "course:worldbuilding-operating-system/lesson:00-course-orientation",
    service: "learning",
    result: "success",
    details: "Learner opened lesson reader",
  },
  {
    id: "e2",
    timestamp: "2026-10-09T14:30:00.000Z",
    actor: "alex.rivera@example.com",
    action: "auth.login",
    resource: "auth",
    service: "gateway",
    result: "success",
    details: "OIDC authorization code + PKCE login",
  },
  {
    id: "e3",
    timestamp: "2026-10-09T14:28:00.000Z",
    actor: "alex.rivera@example.com",
    action: "booking.create",
    resource: "booking:BK-1001",
    service: "mentorship",
    result: "success",
    details: "Booking request submitted for Systemic World Architecture Review",
  },
  {
    id: "e4",
    timestamp: "2026-10-09T11:00:00.000Z",
    actor: "jordan.patel@example.com",
    action: "booking.approve",
    resource: "booking:BK-1002",
    service: "mentorship",
    result: "success",
    details: "Mentor confirmed booking",
  },
  {
    id: "e5",
    timestamp: "2026-10-09T10:05:00.000Z",
    actor: "riley.chen@example.com",
    action: "auth.login",
    resource: "auth",
    service: "gateway",
    result: "denied",
    details: "Account suspended — access denied",
  },
  {
    id: "e6",
    timestamp: "2026-10-09T09:00:00.000Z",
    actor: "casey.kim@example.com",
    action: "principal.role.update",
    resource: "principal:p004",
    service: "gateway",
    result: "success",
    details: "Role changed to instructor",
  },
];

export function getPrincipal(id: string) {
  return mockPrincipals.find((p) => p.id === id);
}
