"use client";

import { useEffect, useId, useState } from "react";
import type { Field } from "../lib/content";

export const inputClass = "w-full rounded-lg border border-border/35 bg-white px-3 py-2.5 text-sm text-secondary placeholder:text-muted focus:border-primary focus:outline-2 focus:outline-primary/20";
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
    if (field.type === "number" && value && (!Number.isFinite(Number(value)) || (field.min !== undefined && Number(value) < field.min) || (field.max !== undefined && Number(value) > field.max))) return `Check the value for ${field.label}.`;
    if (value && /image$|href$|maplink$/i.test(field.key) && !safeSource.test(value)) return `${field.label} must start with / or https://.`;
  }
  return "";
}

export default function EditorFields({ fields, values, onChange }: { fields: Field[]; values: Record<string, string>; onChange: (key: string, value: string) => void }) {
  const prefix = useId();
  return <div className="grid gap-5 sm:grid-cols-2">{fields.map((field) => {
    const id = `${prefix}-${field.key}`;
    return <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">{field.label}{field.required && <span className="text-primary"> *</span>}</label>
      {field.type === "textarea" ? <textarea id={id} value={values[field.key] ?? ""} required={field.required} rows={field.key === "body" ? 14 : field.key === "quote" ? 5 : 4} onChange={(event) => onChange(field.key, event.target.value)} className={inputClass} aria-describedby={field.hint ? `${id}-hint` : undefined} /> : <input id={id} type={field.type ?? "text"} value={values[field.key] ?? ""} required={field.required} min={field.min} max={field.max} step={field.type === "number" ? 1 : undefined} onChange={(event) => onChange(field.key, event.target.value)} className={inputClass} aria-describedby={field.hint ? `${id}-hint` : undefined} />}
      {field.hint && <p id={`${id}-hint`} className="mt-2 text-xs leading-5 text-muted">{field.hint}</p>}
      {isImageField(field.key) && <Thumbnail src={values[field.key]} className="mt-3 aspect-video w-full max-w-xs border border-border/20" />}
    </div>;
  })}</div>;
}
