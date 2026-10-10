import PolicyPage, { policyMetadata } from "../components/PolicyPage";

export const generateMetadata = () => policyMetadata("cancellation-and-refund-policy");

export default function CancellationAndRefundPolicyPage() {
  return <PolicyPage slug="cancellation-and-refund-policy" />;
}
