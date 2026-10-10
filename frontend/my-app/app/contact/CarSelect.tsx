"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import type { EnquiryCar } from "./EnquiryForm";

const noPreference = { id: "", name: "Not sure yet: help me choose" };

export default function CarSelect({ id, cars, defaultValue, className, invalid, describedBy }: {
  id: string; cars: EnquiryCar[]; defaultValue: string; className: string; invalid: boolean; describedBy?: string;
}) {
  const [selected, setSelected] = useState(defaultValue);
  const [query, setQuery] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const matches = cars.filter((car) => car.name.toLowerCase().includes((query ?? "").trim().toLowerCase()));
  const options = [noPreference, ...matches];
  const selectedName = cars.find((car) => car.id === selected)?.name ?? "";

  function choose(id: string) {
    setSelected(id); setQuery(null); setOpen(false); setActive(0);
  }
  function highlight(index: number) {
    setActive(index);
    optionRefs.current[index]?.scrollIntoView({ block: "nearest" });
  }
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      if (open) event.preventDefault();
      setOpen(false); setQuery(null); return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) { setOpen(true); highlight(event.key === "ArrowDown" ? 0 : options.length - 1); }
      else highlight((active + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
    } else if (open && (event.key === "Home" || event.key === "End")) {
      event.preventDefault(); highlight(event.key === "Home" ? 0 : options.length - 1);
    } else if (open && event.key === "Enter") {
      event.preventDefault(); choose(options[active]?.id ?? "");
    }
  }

  return <div className="relative" onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setQuery(null); }
  }}>
    <input type="hidden" name="carId" value={selected} />
    <input ref={inputRef} id={id} type="text" role="combobox" aria-expanded={open} aria-controls={`${id}-options`} aria-haspopup="listbox" aria-autocomplete="list" aria-activedescendant={open ? `${id}-option-${active}` : undefined} aria-invalid={invalid} aria-describedby={describedBy}
      autoComplete="off" placeholder={noPreference.name} value={query ?? selectedName} className={`${className} pr-12`}
      onFocus={() => { setOpen(true); setActive(Math.max(0, options.findIndex((car) => car.id === selected))); }}
      onChange={(event) => {
        const search = event.target.value;
        setQuery(search); setSelected(""); setOpen(true);
        setActive(search.trim() && cars.some((car) => car.name.toLowerCase().includes(search.trim().toLowerCase())) ? 1 : 0);
      }} onKeyDown={onKeyDown}
    />
    <button type="button" tabIndex={-1} aria-label={open ? "Close car options" : "Show car options"} aria-expanded={open} aria-controls={`${id}-options`} className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-r-lg text-muted hover:text-primary"
      onMouseDown={(event) => event.preventDefault()} onClick={() => {
        if (open) setOpen(false);
        else { inputRef.current?.focus(); setQuery(null); setOpen(true); setActive(0); }
      }}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className={`size-4 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
    </button>
    {open && <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-lg border border-border/30 bg-white shadow-lg">
      <ul id={`${id}-options`} role="listbox" aria-label="Available cars" className="max-h-60 overflow-y-auto overscroll-contain py-1">
        {options.map((car, index) => <li key={car.id} ref={(element) => { optionRefs.current[index] = element; }} id={`${id}-option-${index}`} role="option" aria-selected={car.id === selected}
          className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3.5 py-2 text-sm ${active === index ? "bg-primary-50 text-primary-700" : "text-secondary"}`}
          onMouseDown={(event) => event.preventDefault()} onMouseEnter={() => setActive(index)} onClick={() => choose(car.id)}>
          <span>{car.name}</span>{car.id === selected && <span aria-hidden="true" className="text-primary">✓</span>}
        </li>)}
      </ul>
      {matches.length === 0 && <p role="status" className="border-t border-border/20 px-3.5 py-3 text-xs text-muted">No cars match your search. Try another name.</p>}
    </div>}
  </div>;
}
