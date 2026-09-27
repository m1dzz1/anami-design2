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
      className="relative overflow-hidden bg-[linear-gradient(160deg,var(--anami-forest)_0%,#173a30_45%,var(--anami-ink)_100%)] py-20 sm:py-24 lg:py-28"
    >
      {/* Restrained architectural lines */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[calc(var(--gutter)*0.5)] w-px bg-white/[0.05]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.06]" />

      <div className="container-x grid items-center gap-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-16 xl:gap-20">
        {/* Layered photographic composition */}
        <div data-reveal="composition" className="relative aspect-[4/4.4] w-full sm:aspect-[1.38/1]">
          {/* Nature — sits behind, upper right */}
          <div
            data-reveal-img
            data-depth="-6" className="absolute right-0 top-[6%] h-[48%] w-[44%] overflow-hidden sm:right-[3%] sm:h-[58%] sm:w-[40%]"
          >
            <Image
              src={images.aboutNature.src}
              placeholder="blur"
              blurDataURL={images.aboutNature.blur}
              alt={a.imageNatureAlt}
              fill
              sizes="(min-width: 1024px) 20vw, 45vw"
              className="object-cover object-[40%_60%]"
            />
            <div className="absolute inset-0 bg-ink/15" />
          </div>

          {/* Main building — dominates the left */}
          <div
            data-reveal-img
            className="absolute left-0 top-0 h-[86%] w-[74%] overflow-hidden sm:h-[100%] sm:w-[66%]"
          >
            <Image
              src={images.aboutMain.src}
              placeholder="blur"
              blurDataURL={images.aboutMain.blur}
              alt={a.imageMainAlt}
              fill
              sizes="(min-width: 1024px) 34vw, 75vw"
              className="object-cover object-[35%_55%]"
            />
          </div>

          {/* Office interior — overlapping, lower right */}
          <div
            data-reveal-img
            data-depth="8" className="absolute bottom-0 right-0 h-[46%] w-[62%] overflow-hidden border border-white/70 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)] sm:bottom-[-2%] sm:right-0 sm:h-[62%] sm:w-[52%]"
          >
            <Image
              src={images.aboutInterior.src}
              placeholder="blur"
              blurDataURL={images.aboutInterior.blur}
              alt={a.imageInteriorAlt}
              fill
              sizes="(min-width: 1024px) 28vw, 62vw"
              className="object-cover object-[30%_50%]"
            />
          </div>

          {/* Caption card */}
          <div
            data-reveal-caption
            className="absolute bottom-[8%] left-[-0.75rem] hidden bg-ink/80 py-4 pl-6 pr-8 backdrop-blur-sm sm:block lg:left-[-1.5rem]"
          >
            <span aria-hidden="true" className="absolute -bottom-6 left-0 top-[-1.5rem] w-px bg-white/70" />
            <p className="text-[0.8125rem] leading-[1.4] text-white/90">
              {a.imageCaption.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* Text composition */}
        <div className="relative">
          {/* Vertical architectural rule, top right (reference) */}
          <span aria-hidden="true" className="absolute right-0 top-[3.5rem] hidden h-44 w-px bg-white/40 xl:block" />
          <p data-reveal-text className="kicker text-mint">
            {a.kicker}
          </p>
          <h2 id="about-title" className="display mt-6 text-[clamp(2.8rem,14vw,7.4rem)] text-white lg:text-[clamp(4rem,6.4vw,7rem)]">
            <span className="block overflow-hidden pb-[0.04em]"><span data-line className="block">{a.titleLine1}</span></span>
            <span className="block overflow-hidden pb-[0.04em]"><span data-line className="block">
              {a.titleLine2Plain} <span className="text-mint">{a.titleLine2Accent}</span>
            </span></span>
          </h2>
          <div className="mt-8 flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between xl:gap-10">
            <div data-reveal-text className="max-w-[34rem] text-[1rem] leading-[1.65] text-white/85">
              <div className="space-y-5">
                {a.primary.map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </div>
              <AboutMore paragraphs={a.secondary} moreLabel={a.more} lessLabel={a.less} />
            </div>

            {/* Supporting statement */}
            <div data-reveal-text className="flex items-center gap-6 xl:block xl:shrink-0 xl:pb-16">
              <span aria-hidden="true" className="h-px w-12 bg-mint/60 xl:hidden" />
              <p className="text-[0.875rem] leading-[1.45] text-white/80">
                {a.statement.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
