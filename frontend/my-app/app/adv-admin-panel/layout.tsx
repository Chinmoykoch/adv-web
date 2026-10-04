import type { Metadata } from "next";

// Shared by the login page and the studio. The sidebar shell lives in (studio)/layout.tsx
// so the login page renders without it.
export const metadata: Metadata = { title: "Content Studio", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
