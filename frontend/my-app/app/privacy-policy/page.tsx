import PolicyPage, { policyMetadata } from "../components/PolicyPage";

export const generateMetadata = () => policyMetadata("privacy-policy");

export default function PrivacyPolicyPage() {
  return <PolicyPage slug="privacy-policy" />;
}
