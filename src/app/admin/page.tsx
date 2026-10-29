import { AdminCapabilityPage } from "@/components/admin/AdminCapabilityPage";

export const metadata = { title: "Administration" };

export default function AdminOverviewPage() {
  return (
    <AdminCapabilityPage eyebrow="Authorized administration" title="Operate with clarity and accountability."
      summary="Operational tools stay separate from the learner experience. Each role below needs a server that verifies who you are and what you may do before any record is shown."
      operations={[
        "Instructor: review lesson drafts and approve publication through the content contracts.",
        "Principals: manage people and roles held by the identity service.",
        "Mentorship: handle real booking requests once a booking service exists.",
        "Audit: read an access-controlled trail of administrative changes.",
      ]} />
  );
}
