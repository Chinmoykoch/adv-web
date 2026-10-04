"use client";

import { useRef, useState } from "react";
import { uploadImage } from "../lib/api";
import { secondaryButton } from "./EditorFields";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif";
const MAX_BYTES = 15 * 1024 * 1024;

// Upload button and drop zone for an image field. The backend converts the file to WebP,
// stores it in Supabase Storage and returns its public URL, which is written into the field.
export default function ImageUpload({ folder, name, describedBy, onUploaded }: { folder: string; name?: string; describedBy?: string; onUploaded: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  async function send(file: File | undefined) {
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    setError(""); setMessage("");
    if (!file.type.startsWith("image/")) return setError("Choose an image file (JPG, PNG, WebP or AVIF).");
    if (file.size > MAX_BYTES) return setError("That image is larger than 15 MB. Choose a smaller one.");
    setProgress(0);
    try {
      const result = await uploadImage(file, { folder, name, onProgress: setProgress });
      onUploaded(result.url);
      setMessage(`Uploaded and optimized: ${result.width} × ${result.height}, ${Math.max(1, Math.round(result.bytes / 1024))} KB WebP (was ${Math.round(file.size / 1024)} KB).`);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Upload failed. Try again.");
    } finally {
      setProgress(null);
    }
  }

  const busy = progress !== null;
  return <div
    className={`mt-3 rounded-lg border border-dashed p-3 transition-colors ${dragging ? "border-primary bg-primary-50" : "border-border/40"}`}
    onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true); }}
    onDragLeave={() => setDragging(false)}
    onDrop={(event) => { event.preventDefault(); setDragging(false); if (!busy) send(event.dataTransfer.files[0]); }}
  >
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className={secondaryButton} disabled={busy} onClick={() => inputRef.current?.click()} aria-describedby={describedBy}>
        {busy ? `Uploading… ${progress}%` : "Upload image"}
      </button>
      <span className="text-xs text-muted">or drop a file here · converted to WebP automatically</span>
      <input ref={inputRef} type="file" accept={ACCEPT} className="sr-only" tabIndex={-1} aria-label="Choose an image to upload" onChange={(event) => send(event.target.files?.[0])} />
    </div>
    {busy && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface" role="progressbar" aria-label="Upload progress" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} /></div>}
    {message && <p role="status" className="mt-2 text-xs text-primary">{message}</p>}
    {error && <p role="alert" className="mt-2 text-xs text-danger">{error}</p>}
  </div>;
}
