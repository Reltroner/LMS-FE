import { Badge } from "@/components/ui/Badge";
import { Heading } from "@/components/ui/Heading";
import { MentorshipAdministration } from "@/components/admin/MentorshipAdministration";

export const metadata = { title: "Mentorship Admin" };

export default function AdminMentorshipPage() {
  return (
    <>
      <div>
        <Badge tone="accent">Mentorship Service</Badge>
        <Heading level={1} className="mt-2">Mentorship Administration</Heading>
        <p className="mt-1 text-sm text-muted-foreground">
          Review bookings and perform permitted lifecycle actions.
        </p>
      </div>
      <div className="mt-6">
        <MentorshipAdministration />
      </div>
    </>
  );
}
