import Image from "next/image";
import type { Dictionary } from "@/i18n/types";
import { images, sectionIds } from "@/content/site";

export default function Editorial({ t }: { t: Dictionary }) {
  const e = t.editorial;

  return (
    <section
      id={sectionIds.editorial}
      aria-labelledby="editorial-title"
      className="editorial relative isolate overflow-hidden bg-ink"
    >
      {/* Photograph — from tablet up it starts right after the text column (never under the headline) */}
      <div className="editorial-photo absolute inset-0 -z-10">
        <div data-parallax className="absolute inset-x-0 -inset-y-[14%]">
          <Image
            src={images.editorial.src}
            placeholder="blur"
            blurDataURL={images.editorial.blur}
            alt={e.imageAlt}
            fill
            sizes="(min-width: 768px) 70vw, 100vw"
            className="object-cover object-[30%_45%] md:object-[0%_42%]"
          />
        </div>
        {/* Soft blend of the photo's left edge into the ink field */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 hidden w-[clamp(5rem,9vw,10rem)] bg-gradient-to-r from-ink via-ink/70 to-transparent md:block"
        />
        {/* Green-toned grade over the photo, deepening from the right edge across most of the image */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgb(14_42_46/0.08)_0%,rgb(14_42_46/0.3)_28%,rgb(14_42_46/0.62)_55%,rgb(14_42_46/0.86)_100%)] max-md:bg-[linear-gradient(180deg,rgb(14_42_46/0.92)_0%,rgb(14_42_46/0.6)_50%,rgb(14_42_46/0.85)_100%)]"
        />
      </div>

      <div className="container-x grid items-center gap-12 py-20 sm:py-24 md:min-h-[26rem] md:grid-cols-[var(--ed-text)_minmax(0,1fr)] md:gap-8 md:py-16 lg:min-h-[28rem] xl:min-h-[30rem]">
        <div>
          <p data-reveal-text className="kicker text-white">
            {e.kicker}
          </p>
          <h2 id="editorial-title" className="editorial-title display mt-5 text-white">
            <span className="block overflow-hidden pb-[0.04em]">
              <span data-line className="block">{e.titleLine1}</span>
            </span>
            <span className="block overflow-hidden pb-[0.04em]">
              <span data-line className="block">{e.titleLine2}</span>
            </span>
          </h2>
          <p data-reveal-text className="mt-4 max-w-[21rem] text-[1.1875rem] leading-[1.4] text-white/90 md:max-w-none">
            {e.lead}
          </p>
        </div>

        <div data-values-panel className="glass px-7 py-3 sm:px-10 sm:py-5 md:w-full md:max-w-[26rem] md:justify-self-end md:px-8 lg:px-10">
          <h3 className="sr-only">{e.valuesLabel}</h3>
          <ol>
            {e.values.map((value, index) => (
              <li key={value} data-value-item className="group relative flex items-center gap-10 py-5 sm:gap-14 md:gap-10 lg:gap-14">
                <span
                  aria-hidden="true"
                  className="display w-12 text-[2.9rem] font-medium leading-none text-mint transition-colors duration-500 group-hover:text-white sm:text-[3.3rem]"
                >
                  0{index + 1}
                </span>
                <span className="text-[1.0625rem] text-white transition-transform duration-500 ease-out-expo group-hover:translate-x-2">
                  {value}
                </span>
                {index < e.values.length - 1 && (
                  <span
                    aria-hidden="true"
                    data-value-rule
                    className="absolute bottom-0 left-0 right-[6%] h-px origin-left bg-white/45"
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
