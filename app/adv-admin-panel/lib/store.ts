"use client";

import { useMemo, useSyncExternalStore } from "react";
import { collectionKeys, initialContent, pageKeys, type ContentStore } from "./content";

const STORAGE_KEY = "adventurecarz-admin-drafts-v1";
const CHANGE_EVENT = "adventurecarz-admin-change";
const LOADING = "__loading__";
const UNAVAILABLE = "__unavailable__";

function snapshot() {
  try { return window.localStorage.getItem(STORAGE_KEY) ?? ""; }
  catch { return UNAVAILABLE; }
}
function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY || event.key === null) callback(); };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => { window.removeEventListener("storage", onStorage); window.removeEventListener(CHANGE_EVENT, callback); };
}
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function contentRecord(value: unknown) {
  return record(value) && record(value.values) && Object.values(value.values).every((item) => typeof item === "string") &&
    (value.updatedAt === null || (typeof value.updatedAt === "string" && Number.isFinite(Date.parse(value.updatedAt))));
}
export function parseContent(raw: string): ContentStore {
  const value: unknown = JSON.parse(raw);
  if (!record(value) || value.version !== 1 || !record(value.pages) || !record(value.collections)) throw new Error("Invalid draft format");
  const pages = value.pages;
  const groups = value.collections;
  if (!pageKeys.every((key) => contentRecord(pages[key])) || !collectionKeys.every((key) => {
    const entries = groups[key];
    return Array.isArray(entries) && entries.every((entry) => contentRecord(entry) && typeof entry.id === "string" && typeof entry.archived === "boolean") && new Set(entries.map((entry) => entry.id)).size === entries.length;
  })) throw new Error("Invalid draft content");
  return value as ContentStore;
}

export function useContent() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => LOADING);
  const result = useMemo(() => {
    if (raw === UNAVAILABLE) return { data: initialContent, error: "Browser storage is unavailable. Enable storage to edit and save drafts." };
    if (raw === LOADING || !raw) return { data: initialContent, error: "" };
    try { return { data: parseContent(raw), error: "" }; }
    catch { return { data: initialContent, error: "Stored drafts could not be read. They have been preserved; editing is blocked to prevent overwriting them." }; }
  }, [raw]);

  function update(updater: (current: ContentStore) => ContentStore) {
    if (raw === LOADING || result.error) throw new Error(result.error || "Drafts are still loading.");
    if (snapshot() !== raw) throw new Error("Drafts changed in another tab. Reload before saving.");
    const next = updater(result.data);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch { throw new Error("Draft could not be saved. Browser storage may be full or disabled."); }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  // Import and reset replace the whole workspace, so they also work as a way out of unreadable drafts.
  function replace(next: string | null) {
    if (raw === LOADING || raw === UNAVAILABLE) throw new Error(raw === LOADING ? "Drafts are still loading." : "Browser storage is unavailable.");
    try { if (next === null) window.localStorage.removeItem(STORAGE_KEY); else window.localStorage.setItem(STORAGE_KEY, next); }
    catch { throw new Error("Drafts could not be saved. Browser storage may be full or disabled."); }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
  function importDrafts(text: string) {
    let parsed: ContentStore;
    try { parsed = parseContent(text); }
    catch { throw new Error("This file is not a valid AdventureCarz backup."); }
    replace(JSON.stringify(parsed));
  }
  const exportDrafts = () => raw && raw !== LOADING && raw !== UNAVAILABLE ? raw : JSON.stringify(initialContent);

  return { ...result, loading: raw === LOADING, update, importDrafts, exportDrafts, resetDrafts: () => replace(null) };
}
