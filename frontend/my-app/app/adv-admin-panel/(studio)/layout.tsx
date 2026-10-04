import AdminShell from "../components/AdminShell";

// Every page in this group requires an admin session; proxy.ts redirects everyone else to the login page.
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
