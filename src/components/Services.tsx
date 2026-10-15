import type { Dictionary } from "@/i18n/types";
import { sectionIds, serviceAnchor, serviceImages, type ServiceKey } from "@/content/site";
import ServiceCard from "./ServiceCard";
import FacadeSketch from "./FacadeSketch";

const serviceKeys: ServiceKey[] = ["development", "leasing", "management"];

export default function Services({ t }: { t: Dictionary }) {
  const s = t.services;

  return (
    <section
      id={sectionIds.services}
      aria-labelledby="services-title"
      className="on-light relative z-[var(--z-overlap)] bg-mist pb-[calc(var(--section-y)*1.1)] pt-[calc(var(--section-y)*0.85)] text-ink"
    >
      {/* Curved edge rising over the end of the transformation sequence */}
      <div aria-hidden="true" className="curve curve-up bg-mist" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <FacadeSketch variant="services" className="opacity-70 max-md:top-4" />
      </div>

      <div className="container-x relative">
        <div className="grid gap-6 lg:grid-cols-[auto_minmax(3rem,1fr)_minmax(0,25rem)] lg:items-center lg:gap-10">
          <div data-reveal-text>
            <p className="kicker text-teal-deep">{s.kicker}</p>
            <h2 id="services-title" className="display display-lg mt-5 text-ink">
              {s.titleLine1} <span className="text-teal-deep">{s.titleLine2}</span>
            </h2>
          </div>
          <span aria-hidden="true" data-draw className="hidden h-[2px] bg-teal lg:mt-10 lg:block" />
          <p data-reveal-text className="max-w-[var(--measure)] text-[1.0313rem] leading-[1.65] text-muted lg:mt-10">
            {s.intro}
          </p>
        </div>

        <div data-reveal-group className="service-stagger mt-12 grid gap-6 md:grid-cols-2 lg:mt-16 lg:gap-7 xl:grid-cols-3 xl:items-start xl:gap-9">
          {serviceKeys.map((key, index) => (
            <div key={key} data-reveal-item className={index === 2 ? "md:max-xl:col-span-2" : undefined}>
              <ServiceCard
                id={serviceAnchor(key)}
                index={index}
                service={s.items[key]}
                image={serviceImages[key]}
                labels={{ details: s.detailsLabel, close: t.a11y.close }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
