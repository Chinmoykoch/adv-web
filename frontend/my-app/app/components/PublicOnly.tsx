"use client";

import { usePathname } from "next/navigation";

// The root layout also wraps the admin panel; this keeps website-only parts (such as the footer) out of it.
export default function PublicOnly({ children }: { children: React.ReactNode }) {
  return usePathname().startsWith("/adv-admin-panel") ? null : children;
}
