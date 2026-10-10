"use client";

import { useEffect, useState } from "react";
import { apiRequest, errorMessage, useApi } from "../lib/api";
import { inputClass, primaryButton, secondaryButton, useUnsavedChanges } from "./EditorFields";

type Review = { id: string; customerName: string; quote: string; rating: number; reviewedAt: string | null };
type Connection = { configured: boolean; selectedIds: string[]; maxFeatured: number };
type ReviewPage = { items: Review[]; nextPageToken: string | null; totalReviewCount: number | null };
const endpoint = "/api/admin/google-reviews";

export default function GoogleReviewsManager() {
  const connection = useApi<Connection>(`${endpoint}/status`);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState<{ nextPageToken: string | null; total: number | null } | null>(null);
  const [draft, setDraft] = useState<string[] | null>(null);
  const [query, setQuery] = useState("");
  const [rating, setRating] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const selected = draft ?? connection.data?.selectedIds ?? [];
  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(connection.data?.selectedIds ?? []);
  useUnsavedChanges(dirty);

  // Clear fetched review content even if a studio tab is left open indefinitely.
  useEffect(() => {
    if (!page) return;
    const timer = setTimeout(() => { setReviews([]); setPage(null); }, 15 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [page]);

  async function load(more = false) {
    setBusy(true); setError(""); setMessage("");
    try {
      const token = more ? page?.nextPageToken : null;
      const result = await apiRequest<ReviewPage>(`${endpoint}${token ? `?pageToken=${encodeURIComponent(token)}` : ""}`);
      setReviews((previous) => [...new Map([...(more ? previous : []), ...result.items].map((item) => [item.id, item])).values()]);
      setPage({ nextPageToken: result.nextPageToken, total: result.totalReviewCount });
    } catch (issue) { setError(errorMessage(issue)); }
    finally { setBusy(false); }
  }

  async function save() {
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await apiRequest<{ selectedIds: string[] }>(`${endpoint}/selection`, { method: "PUT", body: { ids: selected } });
      connection.setData({ ...connection.data!, selectedIds: result.selectedIds });
      setDraft(null);
      setMessage("Your chosen Google reviews are saved for the website. Manually managed testimonials are kept too.");
    } catch (issue) { setError(errorMessage(issue)); }
    finally { setBusy(false); }
  }

  async function refreshWebsite() {
    setBusy(true); setError(""); setMessage("");
    try {
      await apiRequest(`${endpoint}/refresh`, { method: "POST" });
      setMessage("The website will fetch current versions of your selected reviews on its next visit.");
    } catch (issue) { setError(errorMessage(issue)); }
    finally { setBusy(false); }
  }

  function toggle(id: string) {
    setError(""); setMessage("");
    if (selected.includes(id)) { setDraft(selected.filter((other) => other !== id)); return; }
    if (selected.length >= (connection.data?.maxFeatured ?? 12)) { setError("Remove a selected review before adding another."); return; }
    setDraft([...selected, id]);
  }
  function move(index: number, direction: number) {
    const ids = [...selected];
    [ids[index], ids[index + direction]] = [ids[index + direction], ids[index]];
    setDraft(ids); setMessage("");
  }

  const shown = reviews.filter((review) => (!rating || review.rating === Number(rating)) && `${review.customerName} ${review.quote}`.toLowerCase().includes(query.toLowerCase()));

  return <section aria-labelledby="google-reviews-heading" className="mt-8 min-w-0 rounded-xl border border-border/40 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="mb-2 text-xs uppercase tracking-widest text-primary">Google Business Profile</p><h2 id="google-reviews-heading" className="text-2xl">Choose your Google reviews</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Browse customer feedback and select written reviews for the website. Reviews keep their original wording and rating.</p></div>
      {connection.data?.configured && <button type="button" disabled={busy} className={secondaryButton} onClick={() => load()}>{busy ? "Please wait…" : page ? "Reload reviews" : "Load Google reviews"}</button>}
    </div>

    {connection.loading && <p role="status" className="mt-5 text-sm">Checking the Google reviews connection…</p>}
    {connection.error && <div role="alert" className="mt-5 text-sm text-danger"><p>{connection.error}</p><button type="button" className={`${secondaryButton} mt-3`} onClick={connection.reload}>Retry connection check</button></div>}
    {connection.data && !connection.data.configured && <div className="mt-5 rounded-lg bg-canvas p-5 text-sm leading-6">
      <p className="font-semibold text-secondary">Google reviews are not connected yet.</p>
      <p className="mt-2">The business profile owner or manager needs approved Google Business Profile API access. Your developer can then configure the secure connection. Your current testimonials continue to work.</p>
      <a className="mt-2 inline-flex min-h-11 items-center text-primary underline underline-offset-4" href="https://developers.google.com/my-business/content/prereqs" target="_blank" rel="noopener noreferrer">Google’s setup requirements<span className="sr-only"> (opens in a new tab)</span></a>
      <button type="button" className={`${secondaryButton} ml-3`} onClick={connection.reload}>Check again</button>
    </div>}

    {connection.data?.configured && <>
      <div className="mt-6 border-y border-border/20 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-body text-sm font-semibold">Selected for the website: {selected.length} / {connection.data.maxFeatured}</h3><div className="flex flex-wrap gap-2"><button type="button" className={secondaryButton} disabled={busy || dirty} onClick={refreshWebsite}>Refresh website reviews</button><button type="button" className={primaryButton} disabled={busy || !dirty} onClick={save}>Save selection</button><button type="button" className={secondaryButton} disabled={busy || !dirty} onClick={() => setDraft(null)}>Discard changes</button></div></div>
        {selected.length === 0 ? <p className="mt-3 text-sm text-muted">No Google reviews selected. Choose reviews below; only saved selections appear on the website.</p> : <ol className="mt-4 divide-y divide-border/20">{selected.map((id, index) => <li key={id} className="flex flex-wrap items-center justify-between gap-3 py-2">
          <span className="min-w-0 break-words text-sm">{index + 1}. {reviews.find((review) => review.id === id)?.customerName ?? `Selected review ${index + 1} (load reviews to see the name)`}</span>
          <div className="flex gap-2"><button type="button" aria-label={`Move selected review ${index + 1} up`} className={secondaryButton} disabled={busy || index === 0} onClick={() => move(index, -1)}>↑</button><button type="button" aria-label={`Move selected review ${index + 1} down`} className={secondaryButton} disabled={busy || index === selected.length - 1} onClick={() => move(index, 1)}>↓</button><button type="button" className={secondaryButton} disabled={busy} onClick={() => toggle(id)}>Remove</button></div>
        </li>)}</ol>}
      </div>

      {page && <>
        <div className="mt-5 flex flex-wrap items-end gap-4"><div className="min-w-0 flex-1"><label htmlFor="google-review-search" className="mb-2 block text-xs font-medium">Search loaded reviews</label><input id="google-review-search" type="search" className={inputClass} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Customer name or review text" /></div><div><label htmlFor="google-review-rating" className="mb-2 block text-xs font-medium">Rating</label><select id="google-review-rating" className={inputClass} value={rating} onChange={(event) => setRating(event.target.value)}><option value="">All ratings</option>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}</select></div></div>
        <p className="mt-3 text-xs text-muted">{reviews.length} loaded{page.total !== null && ` of ${page.total}`} · Most recently updated first · Filters apply to loaded reviews.</p>
        <ul className="mt-4 divide-y divide-border/20">{shown.map((review) => <li key={review.id} className="py-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="break-words font-body text-sm font-semibold">{review.customerName}</h3><p className="mt-1 text-xs text-muted">{review.rating} / 5 stars{review.reviewedAt && !Number.isNaN(Date.parse(review.reviewedAt)) && ` · ${new Date(review.reviewedAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}`}</p></div><label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-primary" checked={selected.includes(review.id)} disabled={busy || !review.quote.trim()} onChange={() => toggle(review.id)} />Show on website<span className="sr-only">: review by {review.customerName}</span></label></div>
          <p className="mt-3 whitespace-pre-line break-words text-sm leading-6">{review.quote || "Rating only — no written review to feature."}</p>
        </li>)}</ul>
        {shown.length === 0 && <p className="py-5 text-sm text-muted">No reviews match these filters.</p>}
        {page.nextPageToken && <button type="button" className={`${secondaryButton} mt-4`} disabled={busy} onClick={() => load(true)}>Load more reviews</button>}
      </>}
    </>}
    {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
    {message && <p role="status" className="mt-4 text-sm text-primary">{message}</p>}
  </section>;
}
