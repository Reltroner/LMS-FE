import { AdminCapabilityPage } from "@/components/admin/AdminCapabilityPage";

export const metadata = { title: "Mentorship administration" };

export default function AdminMentorshipPage() {
  return (
    <AdminCapabilityPage eyebrow="Mentorship" title="Mentorship requests"
      summary="There is no booking service yet, so there are no requests, mentors, or time slots to manage."
      operations={[
        "Review incoming requests and the consent each one records.",
        "Confirm or decline requests with a verifiable notification to the learner.",
        "Publish real availability, without placeholder slots.",
      ]} />
  );
}
