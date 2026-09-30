import Image from "next/image";
import { slides } from "./HeroContent";

type Props = { activeSlide: number };

// Dark gradient behind the text: bottom band on small screens, concentrated on the left from lg.
const shade =
  "after:absolute after:inset-0 after:content-[''] " +
  "after:bg-[linear-gradient(0deg,#000d_0%,#0009_45%,#0000_75%),linear-gradient(180deg,#0006_0%,#0000_22%)] " +
  "lg:after:bg-[linear-gradient(0deg,#000a_0%,#0000_38%),linear-gradient(180deg,#0006_0%,#0000_22%),radial-gradient(ellipse_60%_75%_at_0%_55%,#000d_0%,#0008_45%,#0000_100%)]";

export default function HeroBackground({ activeSlide }: Props) {
  return (
    <div className="absolute inset-0 -z-10" aria-hidden="true">
      {slides.map(({ image, imagePosition }, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-opacity duration-1100 ease-in-out motion-reduce:transition-none ${shade} ${index === activeSlide ? "opacity-100" : "opacity-0"}`}
        >
          <Image
            src={image}
            alt=""
            fill
            sizes="100vw"
            preload={index === 0}
            className={`object-cover ${imagePosition}`}
          />
        </div>
      ))}
    </div>
  );
}
