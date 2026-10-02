import type { Metadata } from "next";
import RoutePage from "../components/RoutePage";

export const metadata: Metadata = {
  title: "Contact | AdventureCarz",
};

export default function ContactPage() {
  return <RoutePage title="Contact Us" description="Plan your next journey with AdventureCarz. Contact details and an enquiry form are coming soon." />;
}
