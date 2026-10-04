import type { Metadata } from "next";
import Link from "next/link";
import { safeNextPath } from "../../lib/supabase/config";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

const notices: Record<string, string> = {
  "not-admin": "That account doesn’t have access to the content studio. Sign in with an admin account.",
  "signed-out": "You’ve been signed out.",
};

export default async function LoginPage({ searchParams }: PageProps<"/adv-admin-panel/login">) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const notice = notices[first(params.error) ?? first(params.status) ?? ""];

  return (
    <main className="grid min-h-screen bg-canvas text-secondary lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section aria-hidden="true" className="relative hidden overflow-hidden bg-secondary p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <p className="font-heading text-3xl">AdventureCarz<span className="text-primary">.</span></p>
        <div>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Content studio</p>
          <p className="max-w-md font-heading text-4xl leading-tight">Every story, car and journey on your website, in one place.</p>
        </div>
        <p className="text-xs text-neutral-400">Access is limited to AdventureCarz staff.</p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <p className="mb-10 font-heading text-2xl lg:hidden">AdventureCarz<span className="text-primary">.</span></p>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Content studio</p>
          <h1 className="text-4xl tracking-tight">Sign in</h1>
          <p className="mt-3 text-sm leading-6 text-muted">Use the email and password your administrator set up for you.</p>
          {notice && <p role="status" className="mt-6 rounded-lg border border-primary/15 bg-primary-50 px-4 py-3 text-sm text-secondary">{notice}</p>}
          <LoginForm next={safeNextPath(first(params.next))} />
          <Link href="/" className="mt-10 inline-flex min-h-11 items-center text-sm text-muted hover:text-primary">← Back to website</Link>
        </div>
      </section>
    </main>
  );
}
