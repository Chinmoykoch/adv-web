"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { isSlug, slugify, type Entry, type Field } from "../lib/content";
import ImageUpload from "./ImageUpload";

export const inputClass = "w-full rounded-lg border border-border/35 bg-white px-3 py-2 text-sm text-secondary placeholder:text-muted focus:border-primary focus:outline-2 focus:outline-primary/20";
export const primaryButton = "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50";
export const secondaryButton = "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-border/30 bg-white px-4 text-sm font-medium text-secondary hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40";

export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    const onNavigate = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("a");
      if (!link || link.target === "_blank" || link.href === window.location.href) return;
      if (!window.confirm("Leave without saving your changes?")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", onUnload);
    document.addEventListener("click", onNavigate, true);
    return () => { window.removeEventListener("beforeunload", onUnload); document.removeEventListener("click", onNavigate, true); };
  }, [dirty]);
}

const safeSource = /^(\/(?!\/)|https:\/\/)/i;
export const isImageField = (key: string) => /image$/i.test(key);
// The description field that belongs to an image field: image → imageAlt, shareImage → shareImageAlt.
const ticked = (value: string | undefined) => (value ?? "").split(",").map((part) => part.trim()).filter(Boolean);
const imageOfAlt = (key: string) => (key.endsWith("Alt") && isImageField(key.slice(0, -3)) ? key.slice(0, -3) : null);
// Alt text is required whenever its image is set (and the form has that image field).
const needsAlt = (field: Field, fields: Field[], values: Record<string, string>) => {
  const image = imageOfAlt(field.key);
  return !!image && fields.some((other) => other.key === image) && !!(values[image] ?? "").trim();
};

// Previews use a plain <img> because the source is whatever the editor is typing, not a configured remote.
export function Thumbnail({ src, className = "" }: { src?: string; className?: string }) {
  const [failed, setFailed] = useState("");
  const value = (src ?? "").trim();
  const usable = value && safeSource.test(value) && failed !== value;
  return <span className={`relative block shrink-0 overflow-hidden rounded-lg bg-surface ${className}`}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {usable ? <img src={value} alt="" onError={() => setFailed(value)} className="absolute inset-0 size-full object-cover" /> : <span aria-hidden="true" className="absolute inset-0 grid place-items-center text-[10px] uppercase tracking-widest text-muted">{value ? "No preview" : "No image"}</span>}
  </span>;
}

export function validateFields(fields: Field[], values: Record<string, string>) {
  for (const field of fields) {
    const value = (values[field.key] ?? "").trim();
    if (field.required && !value) return `${field.label} is required.`;
    if (!value && needsAlt(field, fields, values)) return `${field.label} is required when an image is set. Describe what the image shows.`;
    if (field.type === "number" && value && (!Number.isFinite(Number(value)) || (field.min !== undefined && Number(value) < field.min) || (field.max !== undefined && Number(value) > field.max))) return `Check the value for ${field.label}.`;
    if (value && /image$|href$|maplink$|canonicalurl$/i.test(field.key) && !safeSource.test(value)) return `${field.label} must start with / or https://.`;
    const unknown = field.type === "checkboxes" ? ticked(value).find((part) => !field.options?.some((option) => option.value === part)) : undefined;
    if (unknown) return `${field.label}: “${unknown}” isn’t one of the options. Tick the ones that apply.`;
    if (field.type === "slug" && value && !isSlug(value)) return `${field.label} can only use lowercase letters, numbers and single hyphens, for example: toyota-innova-crysta.`;
    if (field.key === "sameAs" && value && !value.split("\n").every((line) => !line.trim() || /^https:\/\//i.test(line.trim()))) return `Each ${field.label.toLowerCase()} entry must start with https://.`;
  }
  return "";
}

// Fills an empty slug from the title and rejects a slug another entry already uses,
// since two entries cannot share one public URL.
export function resolveSlug(values: Record<string, string>, others: Entry[]) {
  const slug = (values.slug ?? "").trim() || slugify(values.title ?? "");
  if (!slug) return { error: "Add a name so a URL slug can be created." };
  if (others.some((entry) => (entry.values.slug ?? "") === slug)) return { error: `The URL slug “${slug}” is already used by another entry. Choose a different one.` };
  return { values: { ...values, slug } };
}

function Counter({ length, recommended }: { length: number; recommended: number }) {
  return <span className={`text-xs tabular-nums ${length > recommended ? "font-medium text-danger" : "text-muted"}`}>{length} / {recommended}</span>;
}

// Automatic fields are shown greyed out and can't be typed in.
const lockedInputClass = `${inputClass.replace("bg-white", "bg-surface")} cursor-default text-muted`;

// `folder` is where uploads from these fields are stored in Supabase Storage (the collection or "pages").
// `preview` is rendered in place of a field of type "preview" (the Google result preview).
// `placeholders` shows what an empty field falls back to, such as the generated search title.
export default function EditorFields({ fields, values, onChange, folder = "pages", preview, placeholders }: { fields: Field[]; values: Record<string, string>; onChange: (key: string, value: string) => void; folder?: string; preview?: ReactNode; placeholders?: Record<string, string> }) {
  const prefix = useId();
  // Slug fields the editor chose to change by hand; all others follow the name.
  const [unlocked, setUnlocked] = useState<string[]>([]);
  return <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 2xl:grid-cols-3">{fields.map((field) => {
    const id = `${prefix}-${field.key}`;
    if (field.type === "preview") return preview ? <div key={field.key} className="sm:col-span-full"><p className="mb-1.5 text-sm font-medium">{field.label}</p>{preview}</div> : null;
    if (field.type === "checkbox") return <div key={field.key} className="sm:col-span-full">
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium"><input id={id} type="checkbox" checked={values[field.key] === "true"} onChange={(event) => onChange(field.key, event.target.checked ? "true" : "")} className="size-4 accent-primary" aria-describedby={field.hint ? `${id}-hint` : undefined} />{field.label}</label>
      {field.hint && <p id={`${id}-hint`} className="mt-1 text-xs leading-5 text-muted">{field.hint}</p>}
    </div>;
    if (field.type === "checkboxes") {
      const selected = ticked(values[field.key]);
      // Saved in option order; ticking or unticking also drops any value that isn't an option.
      const toggle = (option: string, on: boolean) => onChange(field.key, (field.options ?? []).map((item) => item.value).filter((item) => (item === option ? on : selected.includes(item))).join(", "));
      return <fieldset key={field.key} className="sm:col-span-full" aria-describedby={field.hint ? `${id}-hint` : undefined}>
        <legend className="mb-1.5 text-sm font-medium">{field.label}{field.required && <span className="text-primary"> *</span>}</legend>
        <div className="flex flex-wrap gap-2">{field.options?.map((option) => <label key={option.value} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border/35 bg-white px-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary-50 has-[:checked]:text-primary">
          <input type="checkbox" checked={selected.includes(option.value)} onChange={(event) => toggle(option.value, event.target.checked)} className="size-4 accent-primary" />{option.label}
        </label>)}</div>
        {field.hint && <p id={`${id}-hint`} className="mt-1.5 text-xs leading-5 text-muted">{field.hint}</p>}
      </fieldset>;
    }
    const required = field.required || needsAlt(field, fields, values);
    const image = isImageField(field.key);
    // Image addresses come only from uploads. A slug is created from the name until "Change" is clicked.
    const locked = image || (field.type === "slug" && !unlocked.includes(field.key));
    const autoSlug = slugify(values.title ?? "");
    const value = field.type === "slug" && locked ? values[field.key] || autoSlug : values[field.key] ?? "";
    const action = image ? (values[field.key] ? { label: "Remove", run: () => onChange(field.key, "") } : null)
      : field.type === "slug" && locked ? { label: "Change", run: () => { setUnlocked((keys) => [...keys, field.key]); requestAnimationFrame(() => document.getElementById(id)?.focus()); } }
      : null;
    const placeholder = placeholders?.[field.key] ?? (image ? "Upload an image below" : field.type === "slug" ? autoSlug || "Created from the name" : undefined);
    return <div key={field.key} className={field.type === "textarea" ? "sm:col-span-full" : ""}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3"><label htmlFor={id} className="block text-sm font-medium">{field.label}{required && <span className="text-primary"> *</span>}</label>{field.recommended && <Counter length={(values[field.key] ?? "").trim().length} recommended={field.recommended} />}</div>
      {field.type === "select" ? <select id={id} value={values[field.key] ?? ""} required={field.required} onChange={(event) => onChange(field.key, event.target.value)} className={inputClass} aria-describedby={field.hint ? `${id}-hint` : undefined}>
        {!field.required && <option value="">—</option>}
        {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select> : field.type === "textarea" ? <textarea id={id} value={values[field.key] ?? ""} required={required} placeholder={placeholder} rows={field.key === "body" ? 14 : field.key === "quote" ? 5 : field.recommended ? 3 : 4} onChange={(event) => onChange(field.key, event.target.value)} className={inputClass} aria-describedby={field.hint ? `${id}-hint` : undefined} /> : <div className="flex gap-2">
        <input id={id} type={field.type === "slug" ? "text" : field.type ?? "text"} value={value} readOnly={locked} required={required} placeholder={placeholder} min={field.min} max={field.max} step={field.type === "number" ? field.step ?? 1 : undefined} spellCheck={field.type === "slug" || image ? false : undefined} autoCapitalize={field.type === "slug" ? "none" : undefined} onChange={(event) => onChange(field.key, field.type === "slug" ? event.target.value.toLowerCase() : event.target.value)} className={`min-w-0 flex-1 ${locked ? lockedInputClass : inputClass}`} aria-describedby={field.hint ? `${id}-hint` : undefined} />
        {action && <button type="button" onClick={action.run} className={`${secondaryButton} shrink-0`} aria-label={`${action.label} ${field.label.toLowerCase()}`}>{action.label}</button>}
      </div>}
      {field.hint && <p id={`${id}-hint`} className="mt-1.5 text-xs leading-5 text-muted">{field.hint}</p>}
      {image && <>
        {/* The file is named after the image description (or the entry's title) so its URL is readable. */}
        <ImageUpload folder={folder} name={values[`${field.key}Alt`] || values.title || values.name} describedBy={`${id}-hint`} onUploaded={(url) => onChange(field.key, url)} />
        <Thumbnail src={values[field.key]} className="mt-3 aspect-video w-full max-w-xs border border-border/20" />
      </>}
    </div>;
  })}</div>;
}
