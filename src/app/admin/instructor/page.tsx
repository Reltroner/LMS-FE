import { AdminCapabilityPage } from "@/components/admin/AdminCapabilityPage";

export const metadata = { title: "Instructor" };

export default function InstructorPage() {
  return (
    <AdminCapabilityPage eyebrow="Instructor" title="Lesson materials and review"
      summary="Authoring and publication happen in the content repository, where lesson identities and publication allowlists are reviewed. This page will not bypass that process."
      operations={[
        "See which lessons are drafted, in review, or published.",
        "Request publication through the reviewed allowlist and denylist contracts.",
        "Check lesson media and diagrams before release.",
      ]} />
  );
}
