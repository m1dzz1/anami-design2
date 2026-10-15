import Image from "next/image";
import type { Dictionary } from "@/i18n/types";
import { images, sectionIds } from "@/content/site";
import AboutMore from "./AboutMore";

export default function About({ t }: { t: Dictionary }) {
  const a = t.about;

  return (
    <section
      id={sectionIds.about}
      aria-labelledby="about-title"
      className="relative z-[var(--z-overlap)] bg-[linear-gradient(175deg,#176870_0%,var(--teal-surface)_45%,#124f56_100%)] pb-[calc(var(--section-y)+1rem)] pt-[var(--section-y)]"
    >
      {/* Decorative layer: outline word and hairlines (clipped here so the photographs above it may overhang) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="outline-word absolute -right-[0.04em] top-[clamp(1.5rem,4vw,3.5rem)] text-[clamp(6rem,19vw,17rem)]">
          {a.outlineWord}
        </span>
        <span className="absolute inset-x-0 top-0 h-px bg-white/10" />
      </div>
      {/* Curved edge flowing into the transformation sequence */}
      <div aria-hidden="true" className="curve curve-down bg-[#124f56]" />

      <div className="container-x relative grid items-center gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16 xl:gap-24">
        {/* Collage: one dominant photograph, a smaller offset one overlapping its corner */}
        <div data-reveal="composition" className="relative pb-[18%] pl-3 pt-3 sm:pl-5 sm:pt-5 lg:pb-[12%]">
          <span aria-hidden="true" className="absolute left-0 top-0 h-[78%] w-[82%] border border-white/30" />
          <div data-reveal-img className="relative aspect-[4/3] w-[86%] overflow-hidden bg-petrol shadow-[0_30px_60px_-40px_rgb(0_0_0/0.7)]">
            <Image
              src={images.editorial.src}
              placeholder="blur"
              blurDataURL={images.editorial.blur}
              alt={a.imageMainAlt}
              fill
              sizes="(min-width: 1024px) 46vw, 86vw"
              className="object-cover object-[45%_50%]"
            />
          </div>
          <div
            data-reveal-img
            data-depth="6"
            className="absolute bottom-0 right-0 aspect-[4/5] w-[46%] overflow-hidden border-2 border-mist-soft bg-petrol shadow-[0_40px_70px_-30px_rgb(0_0_0/0.6)] lg:-bottom-[calc(var(--section-y)*0.6)] lg:w-[42%]"
          >
            <Image
              src={images.aboutMain.src}
              placeholder="blur"
              blurDataURL={images.aboutMain.blur}
              alt={a.imageInteriorAlt}
              fill
              sizes="(min-width: 1024px) 22vw, 46vw"
              className="object-cover object-[50%_55%]"
            />
          </div>
        </div>

        {/* Copy — revealed as one block */}
        <div data-reveal-text className="relative max-w-[34rem] lg:pt-[clamp(4rem,10vw,9rem)]">
          <p className="kicker text-teal-light">{a.kicker}</p>
          <h2 id="about-title" className="display display-lg mt-6 text-white">
            <span className="block">{a.titleLine1}</span>
            <span className="block">
              {a.titleLine2Plain} <span className="text-teal-light">{a.titleLine2Accent}</span>
            </span>
          </h2>
          <div className="mt-7 space-y-5 text-[1.0313rem] leading-[1.65] text-white/88">
            {a.primary.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
          <AboutMore paragraphs={a.secondary} moreLabel={a.more} lessLabel={a.less} />
          <p className="mt-10 flex flex-wrap gap-x-5 gap-y-1 border-t border-white/15 pt-5 text-[0.875rem] text-white/75">
            {a.statement.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
