import type { CourseLevel } from "@/types/course";

export type EnrollmentStatus = "active" | "completed" | "paused";

export type MockEnrollment = {
  id: string;
  courseSlug: string;
  courseTitle: string;
  courseCategory: string;
  courseLevel: CourseLevel;
  status: EnrollmentStatus;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  lastVisitedLessonSlug: string;
  lastVisitedLessonTitle: string;
  lastVisitedAt: string; // ISO, deterministic
  enrolledAt: string;
};

export type MockBookmark = {
  id: string;
  courseSlug: string;
  courseTitle: string;
  lessonSlug: string;
  lessonTitle: string;
  note: string;
  createdAt: string;
};

// Deterministic mock learner state. No real backend state.
export const mockLearner = {
  id: "learner_mock_001",
  displayName: "Alex Rivera",
  email: "alex.rivera@example.com",
  username: "alexr",
  role: "Learner",
  joinedAt: "2026-01-15T09:00:00.000Z",
};

export const mockEnrollments: MockEnrollment[] = [
  {
    id: "enr_001",
    courseSlug: "backend-engineering",
    courseTitle: "Backend Engineering Fundamentals",
    courseCategory: "engineering",
    courseLevel: "beginner",
    status: "active",
    progressPercent: 42,
    completedLessons: 8,
    totalLessons: 19,
    lastVisitedLessonSlug: "03-rest-introduction",
    lastVisitedLessonTitle: "Introduction to REST APIs",
    lastVisitedAt: "2026-10-09T14:30:00.000Z",
    enrolledAt: "2026-02-01T09:00:00.000Z",
  },
  {
    id: "enr_002",
    courseSlug: "api-design-patterns",
    courseTitle: "API Design Patterns",
    courseCategory: "engineering",
    courseLevel: "intermediate",
    status: "paused",
    progressPercent: 15,
    completedLessons: 3,
    totalLessons: 20,
    lastVisitedLessonSlug: "01-api-contracts",
    lastVisitedLessonTitle: "API Contracts & Surface Area",
    lastVisitedAt: "2026-09-28T11:15:00.000Z",
    enrolledAt: "2026-04-10T09:00:00.000Z",
  },
  {
    id: "enr_003",
    courseSlug: "deployment-and-operations",
    courseTitle: "Deployment & Operations",
    courseCategory: "engineering",
    courseLevel: "intermediate",
    status: "active",
    progressPercent: 8,
    completedLessons: 1,
    totalLessons: 12,
    lastVisitedLessonSlug: "01-deployment-fundamentals",
    lastVisitedLessonTitle: "Deployment Fundamentals",
    lastVisitedAt: "2026-10-08T16:45:00.000Z",
    enrolledAt: "2026-09-01T09:00:00.000Z",
  },
];

export const mockBookmarks: MockBookmark[] = [
  {
    id: "bm_001",
    courseSlug: "backend-engineering",
    courseTitle: "Backend Engineering Fundamentals",
    lessonSlug: "02-http-methods",
    lessonTitle: "HTTP Methods",
    note: "Review idempotency rules before exercises.",
    createdAt: "2026-10-05T10:00:00.000Z",
  },
  {
    id: "bm_002",
    courseSlug: "backend-engineering",
    courseTitle: "Backend Engineering Fundamentals",
    lessonSlug: "03-rest-introduction",
    lessonTitle: "Introduction to REST APIs",
    note: "Re-read Richardson Maturity Model.",
    createdAt: "2026-10-07T08:30:00.000Z",
  },
];

export function getEnrollmentByCourse(courseSlug: string) {
  return mockEnrollments.find((e) => e.courseSlug === courseSlug);
}
