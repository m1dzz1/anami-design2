import Image, { getImageProps } from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { Dictionary } from "@/i18n/types";
import { images, sectionIds, serviceAnchor, type ServiceKey } from "@/content/site";

const heroServiceKeys: ServiceKey[] = ["development", "leasing", "management"];

export default function Hero({ t }: { t: Dictionary }) {
  const h = t.hero;
  const bg = { alt: h.backgroundAlt, fill: true, quality: 70, loading: "eager" } as const;
  const { srcSet: mobileSrcSet } = getImageProps({ ...bg, src: images.heroBackgroundMobile.src, sizes: "75svh" }).props;
  const { props: heroImg } = getImageProps({ ...bg, src: images.heroBackground.src, sizes: "(max-aspect-ratio: 4/3) 134vh, 100vw" });

  return (
    <section
      id={sectionIds.home}
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[90dvh] flex-col overflow-hidden bg-ink"
    >
      {/* Background photograph */}
      <div data-hero-bg className="absolute inset-0 -z-10">
        {/* Art direction: portrait screens (phones) get a portrait crop instead of a huge landscape file */}
        <picture>
          <source media="(max-aspect-ratio: 1/1)" srcSet={mobileSrcSet} sizes="75svh" />
          <img
            {...heroImg}
            alt={h.backgroundAlt}
            fetchPriority="high"
            className="hero-bg object-cover object-[50%_50%] [@media(min-aspect-ratio:1/1)]:object-[68%_50%]"
          />
        </picture>
        {/* Darkening overlay — deeper behind the headline and the service strip, lighter over the lobby arch */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgb(9_30_33/0.86)_0%,rgb(9_30_33/0.66)_38%,rgb(9_30_33/0.32)_70%,rgb(9_30_33/0.42)_100%)] max-lg:bg-[linear-gradient(180deg,rgb(9_30_33/0.72)_0%,rgb(9_30_33/0.7)_55%,rgb(9_30_33/0.88)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ink-deep/80 to-transparent"
        />
      </div>

      <div data-hero-content className="container-x relative flex flex-1 flex-col pt-[calc(var(--nav-h)+2.5rem)] lg:pt-[calc(var(--nav-h)+4.5rem)]">
        <div className="grid flex-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,29rem)]">
          {/* Left — headline block */}
          <div className="max-w-[46rem]">
            <span aria-hidden="true" className="hero-rule mb-7 block h-px w-[4.5rem] origin-left bg-mint/80" />
            <h1 id="hero-title" className="display display-xl">
              <span className="hero-fade mb-5 block font-sans text-[0.6875rem] font-bold leading-[1.4] tracking-[0.22em] text-mint" style={{ animationDelay: "100ms" }}>
                {h.kicker}
              </span>
              <span className="block overflow-hidden pb-[0.04em]">
                <span className="hero-line block text-white" style={{ animationDelay: "150ms" }}>
                  {h.titleBrand}
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.04em]">
                <span className="hero-line block text-white" style={{ animationDelay: "230ms" }}>
                  {h.titleLine1}
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.06em]">
                <span className="hero-line block text-mint" style={{ animationDelay: "310ms" }}>
                  {h.titleLine2}
                </span>
              </span>
            </h1>
            <p
              className="hero-fade mt-6 max-w-[27rem] text-[1.0625rem] leading-[1.5] text-white/92 sm:text-[1.1875rem]"
              style={{ animationDelay: "520ms" }}
            >
              {h.lead}
            </p>
            <a
              href={`#${sectionIds.about}`}
              className="hero-fade btn btn-glass mt-9"
              style={{ animationDelay: "680ms" }}
            >
              {h.cta}
              <ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} className="btn-arrow" />
            </a>
          </div>

          {/* Right — floating glass panel */}
          <a
            href={`#${sectionIds.services}`}
            className="hero-panel glass group relative mt-2 block p-3 transition-colors duration-500 hover:bg-white/10 sm:p-4 lg:mt-6"
            style={{ animationDelay: "600ms" }}
          >
            <div className="flex gap-4 max-sm:items-center sm:flex-col">
              <div className="hero-clip relative aspect-[4/3] w-[42%] shrink-0 overflow-hidden sm:aspect-[16/7.5] sm:w-full" style={{ animationDelay: "800ms" }}>
                <Image
                  src={images.heroFeatured.src}
                  alt={h.panelImageAlt}
                  fill
                  loading="eager"
                  sizes="(min-width: 1024px) 28rem, (min-width: 640px) 90vw, 40vw"
                  className="object-cover object-[50%_40%] transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.05]"
                />
              </div>
              <div className="flex flex-1 items-center justify-between gap-4 px-1 pb-1 sm:px-3 sm:pb-3 sm:pt-2">
                <p className="text-[1.0625rem] leading-snug text-white sm:text-[1.3rem]">
                  <span className="block">{h.panelTitle[0]}</span>
                  <span className="block">{h.panelTitle[1]}</span>
                  <span className="sr-only"> — {h.panelAction}</span>
                </p>
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-ink transition-transform duration-500 ease-out-expo group-hover:translate-x-1 sm:size-12"
                >
                  <ChevronRight size={20} strokeWidth={1.75} />
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* Bottom — service navigation */}
        <div className="mt-12 grid items-end gap-8 pb-8 lg:mt-16 lg:pb-10 xl:grid-cols-[minmax(0,1fr)_auto]" >
          <nav aria-label={t.a11y.servicesNav} className="border-white/25 lg:border-l lg:border-t">
            <ol className="grid sm:grid-cols-3">
              {heroServiceKeys.map((key, index) => (
                <li key={key} className="hero-fade border-t border-white/20 first:border-t-0 sm:border-t-0" style={{ animationDelay: `${950 + index * 120}ms` }}>
                  <a
                    href={`#${serviceAnchor(key)}`}
                    className="group flex items-center gap-4 py-4 transition-colors duration-300 sm:gap-5 lg:px-7 lg:py-5"
                  >
                    <span className="display text-[2rem] font-medium leading-none text-mint transition-colors duration-300 group-hover:text-white lg:text-[2.4rem]">
                      0{index + 1}
                    </span>
                    <span aria-hidden="true" className="h-9 w-px bg-white/40 transition-colors duration-300 group-hover:bg-mint" />
                    <span className="whitespace-nowrap text-[0.8125rem] leading-[1.35] text-white/85 transition-colors duration-300 group-hover:text-white">
                      <span className="block">{h.services[index].lines[0]}</span>
                      <span className="block">{h.services[index].lines[1]}</span>
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      size={16}
                      strokeWidth={1.5}
                      className="ml-auto -translate-x-2 text-mint opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100 lg:mr-2"
                    />
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="hero-fade hidden items-end gap-8 pb-1 xl:flex" style={{ animationDelay: "1300ms" }}>
            <span aria-hidden="true" className="mb-3 h-px w-28 bg-white/35 2xl:w-56" />
            <p className="border-l border-white/60 pl-7 text-[0.8125rem] leading-[1.45] text-white/85">
              {h.tagline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
