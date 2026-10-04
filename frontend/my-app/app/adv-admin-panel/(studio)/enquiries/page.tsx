import type { Metadata } from "next";
import LeadsManager from "../../components/LeadsManager";

export const metadata: Metadata = { title: "Enquiries" };

export default function EnquiriesPage() {
  return <LeadsManager />;
}
