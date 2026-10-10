"use client";

import { usePathname } from "next/navigation";

export type WhatsAppButtonConfig = { number: string; question: string; action: string; message: string };

// Floating "Chat with us" button. It opens WhatsApp's click-to-chat link (wa.me) with the business
// number and a ready-to-send enquiry, so the conversation lands in the business's WhatsApp app.
// Edited in the admin panel: Pages → Contact → WhatsApp button.
export default function WhatsAppButton({ config }: { config: WhatsAppButtonConfig }) {
  const pathname = usePathname();
  if (pathname.startsWith("/adv-admin-panel")) return null;

  const link = (car?: string) => {
    const text = `${config.message || "Hi, I’d like to enquire about renting a car."}${car ? ` I’m interested in the ${car}.` : ""}`;
    return `https://wa.me/${config.number}?text=${encodeURIComponent(text)}`;
  };
  // On a car's page the enquiry names the car, read from the page heading when the button is clicked.
  const addCar = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!/^\/cars\/[^/]+$/.test(pathname)) return;
    const car = document.querySelector("main h1")?.textContent?.trim();
    if (car) event.currentTarget.href = link(car);
  };
  const label = [config.question, config.action].filter(Boolean).join(" ") || "Chat with us";

  return (
    <a
      href={link()}
      onClick={addCar}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} on WhatsApp (opens WhatsApp)`}
      className="group fixed bottom-4 right-4 z-40 flex items-center gap-3 sm:bottom-6 sm:right-6"
    >
      {(config.question || config.action) && (
        <span aria-hidden="true" className="hidden rounded-lg bg-white px-4 py-3 text-sm text-secondary shadow-[0_8px_24px_-8px_#0005] transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none sm:block">
          {config.question} {config.action && <strong className="font-bold">{config.action}</strong>}
        </span>
      )}
      <span aria-hidden="true" className="grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_-6px_#25D36699] transition-transform group-hover:scale-105 group-focus-visible:outline-3 group-focus-visible:outline-offset-2 group-focus-visible:outline-[#25D366] motion-reduce:transition-none sm:size-16">
        {/* WhatsApp logo (Simple Icons, CC0). */}
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-7 sm:size-8">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
      </span>
    </a>
  );
}
