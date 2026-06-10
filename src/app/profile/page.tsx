import { createMetadata } from "@/lib/seo/metadata";
import { ProfilePageClient } from "./ProfilePageClient";

export const metadata = createMetadata({
  title: "Account Overview",
  description: "View your Reltroner Learning Academy account details.",
  path: "/profile",
});

export default function ProfilePage() {
  return <ProfilePageClient />;
}
