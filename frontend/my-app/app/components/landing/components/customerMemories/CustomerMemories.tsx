"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./CustomerMemories.module.css";

// Existing site imagery is temporary; replace with approved customer photographs.
const photos = [
  { src: "/car2.png", alt: "Adventure vehicle on a mountain journey" },
  { src: "/banner3.png", alt: "A scenic stop overlooking the landscape" },
  { src: "/car1.png", alt: "A drive through a forest road" },
  { src: "/car3.png", alt: "A vehicle parked outside a villa" },
  { src: "/banner2.png", alt: "A moment from a road trip" },
];

function Icon({ type }: { type: "expand" | "close" | "previous" | "next" }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={type === "expand" ? "M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" : type === "close" ? "m6 6 12 12M6 18 18 6" : type === "previous" ? "m14 5-7 7 7 7" : "m10 5 7 7-7 7"} />
    </svg>
  );
}

export default function CustomerMemories() {
  const [order, setOrder] = useState([0, 1, 2, 3, 4]);
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const featuredRef = useRef<HTMLButtonElement>(null);
  const active = order[0];

  function selectPhoto(index: number) {
    setOrder((current) => {
      const position = current.indexOf(index);
      const updated = [...current];
      [updated[0], updated[position]] = [updated[position], updated[0]];
      return updated;
    });
  }

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    const trigger = featuredRef.current;
    if (!dialog) return;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      trigger?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  return (
    <section aria-label="Journey photo gallery" className={styles.section}>
      <div className={styles.composition}>
        <button ref={featuredRef} type="button" className={styles.featured} aria-label="Expand featured photograph" aria-haspopup="dialog" onClick={() => setIsOpen(true)}>
          {photos.map((photo, index) => (
            <span key={photo.src} className={`${styles.layer} ${index === active ? styles.visible : ""}`}>
              <Image src={photo.src} alt={index === active ? photo.alt : ""} fill sizes="(min-width: 1024px) 55vw, 85vw" className={styles.photo} />
            </span>
          ))}
          <span className={styles.expand}><Icon type="expand" /></span>
        </button>

        <div className={styles.previews}>
          {order.slice(1).map((index, slot) => (
            <button key={index} type="button" className={`${styles.preview} ${styles[`slot${slot}`]}`} aria-label={`Feature photograph ${index + 1}`} onClick={() => selectPhoto(index)}>
              <Image src={photos[index].src} alt={photos[index].alt} fill sizes="(min-width: 768px) 20vw, 110px" className={styles.photo} />
              <span className={styles.orangeDot} />
            </button>
          ))}
        </div>
      </div>

      <div className={styles.dots} aria-label="Choose a photograph">
        {photos.map((photo, index) => (
          <button key={photo.src} type="button" aria-label={`Feature photograph ${index + 1}`} aria-pressed={index === active} onClick={() => selectPhoto(index)}><span /></button>
        ))}
      </div>

      <dialog ref={dialogRef} className={styles.dialog} aria-label="Photograph viewer" onCancel={() => setIsOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }} onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          selectPhoto((active + (event.key === "ArrowRight" ? 1 : -1) + photos.length) % photos.length);
        }
      }}>
        {isOpen && <>
          <button type="button" className={`${styles.viewerButton} ${styles.close}`} aria-label="Close photo viewer" onClick={() => setIsOpen(false)} autoFocus><Icon type="close" /></button>
          <div className={styles.viewerImage}>
            {photos.map((photo, index) => (
              <span key={photo.src} className={`${styles.layer} ${index === active ? styles.visible : ""}`}>
                <Image src={photo.src} alt={index === active ? photo.alt : ""} fill sizes="90vw" className={styles.containedPhoto} />
              </span>
            ))}
          </div>
          <button type="button" className={`${styles.viewerButton} ${styles.previous}`} aria-label="Previous photograph" onClick={() => selectPhoto((active - 1 + photos.length) % photos.length)}><Icon type="previous" /></button>
          <button type="button" className={`${styles.viewerButton} ${styles.next}`} aria-label="Next photograph" onClick={() => selectPhoto((active + 1) % photos.length)}><Icon type="next" /></button>
          <div className={styles.viewerThumbnails}>
            {photos.map((photo, index) => (
              <button key={photo.src} type="button" aria-label={`View photograph ${index + 1}`} aria-pressed={active === index} onClick={() => selectPhoto(index)}>
                <Image src={photo.src} alt="" fill sizes="80px" className={styles.photo} />
              </button>
            ))}
          </div>
        </>}
      </dialog>
    </section>
  );
}
