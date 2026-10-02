"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import Image from "next/image";

const navigation = [
  { label: "About", href: "/aboutus" },
  { label: "Blog", href: "/blogs" },
  { label: "Cars", href: "/#cars" },
  { label: "Contact", href: "/contact" },
] as const;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (isOpen && event.key === "Escape") {
      setIsOpen(false);
      menuButtonRef.current?.focus();
    }
  }

  return (
    <header onKeyDown={handleKeyDown} className="relative z-50 w-full font-body">
      {/* Transparent backdrop closes the open mobile menu when tapping outside it. */}
      {isOpen && (
        <div aria-hidden="true" onClick={() => setIsOpen(false)} className="fixed inset-0 -z-10 lg:hidden" />
      )}
      <nav
        aria-label="Main navigation"
        className="mx-auto flex min-h-18 w-full flex-wrap items-center justify-between gap-x-3 rounded-[1.75rem] border border-black/10 bg-tertiary px-3 py-2 shadow-sm sm:px-5 lg:gap-x-6 lg:rounded-full"
      >
        <Link
          href="/"
          aria-label="AdventureCarz home"
          className="flex shrink-0 items-center gap-2.5 text-secondary"
          onClick={() => setIsOpen(false)}
        >
          <Image
            src="/logo-mark.png"
            alt=""
            width={383}
            height={514}
            sizes="36px"
            className="h-11 w-auto shrink-0"
          />
          <span className="font-heading text-xl font-semibold tracking-tight sm:text-[22px]">AdventureCarz</span>
        </Link>

        <ul className="hidden items-center gap-9 lg:flex">
          {navigation.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className="inline-flex min-h-10 items-center whitespace-nowrap text-[15px] font-medium text-secondary/80 transition-colors hover:text-primary motion-reduce:transition-none"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/contact"
          className="hidden min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white shadow-[0_3px_12px_#d6460033] transition-colors hover:bg-primary-600 motion-reduce:transition-none lg:inline-flex"
        >
          Enquire Now
          <ArrowIcon />
        </Link>

        <button
          ref={menuButtonRef}
          type="button"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-secondary hover:bg-neutral-200 lg:hidden"
        >
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d={isOpen ? "m6 6 12 12M6 18 18 6" : "M4 7h16M4 12h16M4 17h16"} />
          </svg>
        </button>

        <div
          id="mobile-navigation"
          hidden={!isOpen}
          className="w-full border-t border-neutral-200 pb-2 pt-3 lg:hidden"
        >
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {navigation.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-neutral hover:bg-neutral-100 hover:text-primary"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/contact"
            onClick={() => setIsOpen(false)}
            className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white hover:bg-primary-600"
          >
            Enquire Now
            <ArrowIcon />
          </Link>
        </div>
      </nav>
    </header>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}
