"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { loginPath } from "../../lib/supabase/config";

export default function AccountMenu() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    getSupabaseBrowserClient().auth.getClaims().then(({ data }) => {
      if (active && typeof data?.claims.email === "string") setEmail(data.claims.email);
    });
    return () => { active = false; };
  }, []);

  async function signOut() {
    setPending(true);
    // Signs out this device only; other devices stay signed in until their session ends.
    await getSupabaseBrowserClient().auth.signOut({ scope: "local" });
    router.replace(`${loginPath}?status=signed-out`);
    router.refresh();
  }

  return (
    <div className="mb-3">
      {email && <p className="mb-2 truncate text-xs text-neutral-400" title={email}>Signed in as <span className="text-neutral-200">{email}</span></p>}
      <button type="button" onClick={signOut} disabled={pending} className="inline-flex min-h-11 cursor-pointer items-center text-sm text-neutral-300 hover:text-white disabled:opacity-50">
        {pending ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
