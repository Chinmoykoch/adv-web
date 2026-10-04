"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { isAdmin } from "../../lib/supabase/config";
import { inputClass, primaryButton } from "../components/EditorFields";

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const supabase = getSupabaseBrowserClient();
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) {
        // One message for wrong email or wrong password, so the form doesn't reveal which accounts exist.
        setError(signInError.status === 429 ? "Too many attempts. Wait a minute and try again." : "The email or password is incorrect.");
        return;
      }
      const { data } = await supabase.auth.getClaims();
      if (!isAdmin(data?.claims)) {
        await supabase.auth.signOut({ scope: "local" });
        setError("That account doesn’t have access to the content studio.");
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("Couldn’t reach the sign-in service. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={signIn} className="mt-8 space-y-5">
      <div>
        <label htmlFor="login-email" className="mb-2 block text-sm font-medium">Email</label>
        <input id="login-email" type="email" autoComplete="username" required autoFocus value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="login-password" className="mb-2 block text-sm font-medium">Password</label>
        <div className="relative">
          <input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className={`${inputClass} pr-20`} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} aria-pressed={showPassword} aria-controls="login-password" className="absolute inset-y-0 right-0 min-w-16 cursor-pointer px-3 text-xs font-medium text-primary hover:text-primary-600">
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={pending} className={`${primaryButton} w-full`}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
