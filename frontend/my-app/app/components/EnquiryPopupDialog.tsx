"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import EnquiryForm, { type EnquiryCar, type EnquiryCopy } from "../contact/EnquiryForm";

export default function EnquiryPopupDialog({ cars, copy }: { cars: EnquiryCar[]; copy: EnquiryCopy }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const restoreScroll = useRef<(() => void) | null>(null);
  const pathname = usePathname();

  function releaseScroll() {
    restoreScroll.current?.();
    restoreScroll.current = null;
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        if (!dialog || dialog.open) return;
        dialog.showModal();
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        restoreScroll.current = () => { document.body.style.overflow = previousOverflow; };
      }, 5000);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", schedule);
      dialog?.close();
      releaseScroll();
    };
  }, []);

  // The shared layout persists between pages; navigating dismisses an open popup.
  useEffect(() => { dialogRef.current?.close(); }, [pathname]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={copy.heading || "Send an enquiry"}
      onClose={releaseScroll}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto overscroll-contain rounded-2xl border-0 bg-white p-0 text-secondary shadow-2xl backdrop:bg-secondary/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/20 px-5 py-2 sm:px-6">
        <p className="font-body text-xs font-bold uppercase tracking-[.12em] text-primary">Plan your next journey</p>
        <button type="button" autoFocus aria-label="Close enquiry popup" onClick={() => dialogRef.current?.close()} className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-secondary hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </div>
      <EnquiryForm cars={cars} copy={copy} />
    </dialog>
  );
}
