type Props = {
  count: number;
  activeSlide: number;
  paused: boolean;
  reducedMotion: boolean;
  onSelect: (index: number) => void;
  onTogglePause: () => void;
};

export default function SliderControls({ count, activeSlide, paused, reducedMotion, onSelect, onTogglePause }: Props) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-3" role="group" aria-label="Slideshow controls">
      <div className="flex items-center gap-0.75">
        {Array.from({ length: count }, (_, index) => {
          const selected = activeSlide === index;
          return (
            <button
              key={index}
              type="button"
              aria-label={`Show banner ${index + 1}`}
              aria-pressed={selected}
              className={`grid min-h-11 cursor-pointer place-items-center ${selected ? "w-8.5" : "w-3.75"}`}
              onClick={() => onSelect(index)}
            >
              <span
                className={`h-0.75 rounded transition-colors motion-reduce:transition-none ${selected ? "w-7.5 bg-primary" : "w-2.5 bg-white/40"}`}
              />
            </button>
          );
        })}
      </div>
      <span className="whitespace-nowrap font-mono text-[10px] tracking-widest" aria-live={paused ? "polite" : "off"}>
        {String(activeSlide + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
      </span>
      {!reducedMotion && (
        <button
          type="button"
          className="grid h-11 w-8 cursor-pointer place-items-center opacity-65 hover:opacity-100"
          onClick={onTogglePause}
          aria-label={paused ? "Play slideshow" : "Pause slideshow"}
        >
          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            {paused ? <path d="M3 1.5 10 6l-7 4.5z" /> : <path d="M2 2h3v8H2zm5 0h3v8H7z" />}
          </svg>
        </button>
      )}
    </div>
  );
}
