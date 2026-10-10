import PolicyPage, { policyMetadata } from "../components/PolicyPage";

export const generateMetadata = () => policyMetadata("terms-and-conditions");

export default function TermsAndConditionsPage() {
  return <PolicyPage slug="terms-and-conditions" />;
}
