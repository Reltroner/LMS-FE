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

export const mockEnrollments: MockEnrollment[] = [];

export const mockBookmarks: MockBookmark[] = [];

export function getEnrollmentByCourse(courseSlug: string) {
  return mockEnrollments.find((e) => e.courseSlug === courseSlug);
}
