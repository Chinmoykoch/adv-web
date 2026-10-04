"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export type EnquiryCar = { id: string; slug: string; name: string };
export type EnquiryCopy = { heading: string; description: string; button: string; success: string };

const API = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
const input = "w-full rounded-lg border border-border/40 bg-white px-3.5 py-3 text-sm text-secondary placeholder:text-muted focus:border-primary focus:outline-2 focus:outline-primary/20";
const label = "mb-2 block text-sm font-medium text-secondary";
const today = () => new Date().toISOString().slice(0, 10);

// Sends an enquiry to the backend, which stores it as a lead. "?car=<slug>" in the address
// (from a car's Enquire link) pre-selects that car, and campaign tags (utm_*) are recorded
// so you can see which promotions bring in customers.
export default function EnquiryForm({ cars, copy }: { cars: EnquiryCar[]; copy: EnquiryCopy }) {
  const params = useSearchParams();
  const preselected = cars.find((car) => car.slug === params.get("car"))?.id ?? "";
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pickupDate, setPickupDate] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim();
    setStatus("sending"); setError(""); setFieldErrors({});
    try {
      const response = await fetch(`${API}/api/public/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: text("name"), phone: text("phone"), email: text("email"), message: text("message"),
          carId: text("carId"), pickupDate: text("pickupDate"), returnDate: text("returnDate"),
          consent: form.get("consent") === "on", website: text("website"),
          sourcePath: window.location.pathname,
          utmSource: params.get("utm_source") ?? undefined, utmMedium: params.get("utm_medium") ?? undefined, utmCampaign: params.get("utm_campaign") ?? undefined,
        }),
      });
      if (response.ok) { setStatus("sent"); return; }
      const body = await response.json().catch(() => ({})) as { error?: string; fields?: Record<string, string> };
      setFieldErrors(body.fields ?? {});
      setError(body.error ?? "Your enquiry couldn’t be sent. Please try again or call us.");
    } catch {
      setError("Your enquiry couldn’t be sent. Check your connection and try again, or call us.");
    }
    setStatus("idle");
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-2xl border border-primary/20 bg-white p-8 text-center shadow-sm">
        <p className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-primary text-xl text-white" aria-hidden="true">✓</p>
        <h2 className="text-2xl">Thank you!</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-body">{copy.success || "We’ve received your enquiry and will get back to you shortly."}</p>
      </div>
    );
  }

  const fieldError = (name: string) => fieldErrors[name] && <p id={`${name}-error`} className="mt-1.5 text-xs text-danger">{fieldErrors[name]}</p>;
  const describedBy = (name: string) => (fieldErrors[name] ? `${name}-error` : undefined);

  return (
    <form onSubmit={submit} className="relative rounded-2xl border border-black/5 bg-white p-6 shadow-[0_24px_60px_-30px_#0004] sm:p-8">
      {copy.heading && <h2 className="text-2xl sm:text-3xl">{copy.heading}</h2>}
      {copy.description && <p className="mt-2 text-sm leading-6 text-body">{copy.description}</p>}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="enquiry-name" className={label}>Your name <span className="text-primary">*</span></label>
          <input id="enquiry-name" name="name" required maxLength={120} autoComplete="name" className={input} aria-invalid={!!fieldErrors.name} aria-describedby={describedBy("name")} />
          {fieldError("name")}
        </div>
        <div>
          <label htmlFor="enquiry-phone" className={label}>Phone <span className="text-primary">*</span></label>
          <input id="enquiry-phone" name="phone" type="tel" required maxLength={20} autoComplete="tel" placeholder="+91" className={input} aria-invalid={!!fieldErrors.phone} aria-describedby={describedBy("phone")} />
          {fieldError("phone")}
        </div>
        <div>
          <label htmlFor="enquiry-email" className={label}>Email</label>
          <input id="enquiry-email" name="email" type="email" maxLength={254} autoComplete="email" className={input} aria-invalid={!!fieldErrors.email} aria-describedby={describedBy("email")} />
          {fieldError("email")}
        </div>
        {cars.length > 0 && (
          <div className="sm:col-span-2">
            <label htmlFor="enquiry-car" className={label}>Car you’re interested in</label>
            <select id="enquiry-car" name="carId" defaultValue={preselected} className={input}>
              <option value="">Not sure yet: help me choose</option>
              {cars.map((car) => <option key={car.id} value={car.id}>{car.name}</option>)}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="enquiry-pickup" className={label}>Pickup date</label>
          <input id="enquiry-pickup" name="pickupDate" type="date" min={today()} value={pickupDate} onChange={(event) => setPickupDate(event.target.value)} className={input} />
        </div>
        <div>
          <label htmlFor="enquiry-return" className={label}>Return date</label>
          <input id="enquiry-return" name="returnDate" type="date" min={pickupDate || today()} className={input} aria-invalid={!!fieldErrors.returnDate} aria-describedby={describedBy("returnDate")} />
          {fieldError("returnDate")}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="enquiry-message" className={label}>Trip details</label>
          <textarea id="enquiry-message" name="message" rows={4} maxLength={2000} placeholder="Where are you headed, how many travellers, pickup location…" className={input} />
        </div>
        {/* Honeypot: hidden from people and screen readers, so only bots fill it in. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
          <label htmlFor="enquiry-website">Website</label>
          <input id="enquiry-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 text-sm leading-6 text-body">
            <input name="consent" type="checkbox" required className="mt-1 size-4 shrink-0 accent-primary" aria-describedby={describedBy("consent")} />
            I agree to be contacted by phone, WhatsApp or email about this enquiry.
          </label>
          {fieldError("consent")}
        </div>
      </div>

      {error && <p role="alert" className="mt-5 text-sm text-danger">{error}</p>}
      <button type="submit" disabled={status === "sending"} className="mt-6 inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold uppercase tracking-[.08em] text-white hover:bg-primary-600 disabled:cursor-wait disabled:opacity-60">
        {status === "sending" ? "Sending…" : copy.button || "Send enquiry"}
      </button>
    </form>
  );
}
