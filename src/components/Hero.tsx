import { getImageProps } from "next/image";
import { ArrowRight } from "lucide-react";
import type { Dictionary } from "@/i18n/types";
import { images, sectionIds, serviceAnchor, type ServiceKey } from "@/content/site";

const heroServiceKeys: ServiceKey[] = ["development", "leasing", "management"];

export default function Hero({ t }: { t: Dictionary }) {
  const h = t.hero;
  const bg = { alt: h.backgroundAlt, fill: true, quality: 70, loading: "eager" } as const;
  const { srcSet: mobileSrcSet } = getImageProps({ ...bg, src: images.heroBackgroundMobile.src, sizes: "100vw" }).props;
  const { props: heroImg } = getImageProps({ ...bg, src: images.heroBackground.src, sizes: "(max-aspect-ratio: 4/3) 134vh, 100vw" });

  return (
    <section id={sectionIds.home} aria-labelledby="hero-title" className="hero relative isolate flex flex-col bg-petrol-deep">
      {/* Photograph — full-bleed on large screens, the first screen on phones (melting into petrol below) */}
      <div data-hero-bg className="absolute inset-x-0 top-0 -z-10 h-[min(100svh,50rem)] overflow-hidden lg:inset-0 lg:h-auto">
        <picture>
          <source media="(max-aspect-ratio: 1/1)" srcSet={mobileSrcSet} sizes="100vw" />
          <img
            {...heroImg}
            alt={h.backgroundAlt}
            fetchPriority="high"
            className="hero-bg object-cover"
          />
        </picture>
        <div aria-hidden="true" className="hero-shade absolute inset-0" />
      </div>

      <div className="container-x relative flex flex-1 flex-col pt-[calc(var(--nav-h)+clamp(3rem,9vh,6rem))]">
        <div className="flex flex-1 items-center pb-10 lg:pb-14">
          <div className="max-w-[48rem]">
            <p className="enter kicker text-teal-light" style={{ animationDelay: "80ms" }}>
              {h.kicker}
            </p>
            {/* One sentence for search engines, set as a two-line statement plus a smaller accent line */}
            <h1 id="hero-title" className="display hero-title mt-6 text-white">
              <span className="enter-line block" style={{ animationDelay: "140ms" }}>
                {h.titleLine1}
              </span>
              {" "}
              <span className="enter-line block" style={{ animationDelay: "230ms" }}>
                {h.titleLine2}
              </span>
              {" "}
              <span className="enter-line hero-title-accent mt-3 block text-teal-light" style={{ animationDelay: "320ms" }}>
                {h.titleAccent}
              </span>
            </h1>
            <p className="enter mt-6 max-w-[29rem] hero-lead text-[1.0625rem] font-medium leading-[1.6] text-white sm:text-[1.125rem]" style={{ animationDelay: "320ms" }}>
              {h.lead}
            </p>
            <a href={`#${sectionIds.about}`} className="enter btn btn-primary mt-8" style={{ animationDelay: "440ms" }}>
              {h.cta}
              <ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} className="btn-arrow" />
            </a>
          </div>
        </div>
      </div>

      {/* Three areas of work */}
      <nav aria-label={t.a11y.servicesNav} className="hero-strip relative">
        <ol className="container-x grid lg:grid-cols-3">
          {heroServiceKeys.map((key, index) => (
            <li
              key={key}
              className="enter border-white/15 max-lg:border-b max-lg:last:border-b-0 lg:border-l lg:pl-10 lg:first:border-l-0 lg:first:pl-0 xl:pl-12"
              style={{ animationDelay: `${640 + index * 90}ms` }}
            >
              <a href={`#${serviceAnchor(key)}`} className="group flex min-h-[5.5rem] items-center gap-5 py-4 lg:pr-8 lg:py-6">
                <span className="display w-[2.4ch] shrink-0 text-[2.5rem] font-medium leading-none text-white/85 transition-colors duration-300 group-hover:text-teal-light lg:text-[3rem]">
                  0{index + 1}
                </span>
                <span aria-hidden="true" className="h-10 w-px shrink-0 bg-white/25 transition-colors duration-300 group-hover:bg-teal-light" />
                <span className="text-[0.9375rem] leading-[1.35] text-white/90 transition-colors duration-300 group-hover:text-white">
                  <span className="block">{h.services[index].lines[0]}</span>
                  {" "}
                  <span className="block">{h.services[index].lines[1]}</span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  size={18}
                  strokeWidth={1.5}
                  className="ml-auto text-teal-light transition-transform duration-500 ease-out-expo group-hover:translate-x-1 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
                />
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </section>
  );
}
