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
      className="on-light relative overflow-hidden bg-[linear-gradient(180deg,#f3f7f2_0%,var(--anami-mist)_100%)] py-20 text-ink sm:py-24 lg:py-28"
    >
      <FacadeSketch variant="services" className="max-md:top-4" />

      <div className="container-x relative">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-12 xl:gap-16">
          <div>
            <p data-reveal-text className="kicker text-ink">
              {s.kicker}
            </p>
            <h2 id="services-title" className="display display-lg mt-6">
              <span className="block overflow-hidden pb-[0.04em]"><span data-line className="block text-ink">{s.titleLine1}</span></span>
              <span className="block overflow-hidden pb-[0.04em]"><span data-line className="block text-green">{s.titleLine2}</span></span>
            </h2>
          </div>
          <div data-reveal-text className="lg:pt-12">
            <span aria-hidden="true" className="mb-6 block h-px w-16 bg-green" />
            <p className="max-w-[33rem] text-[1.0625rem] leading-[1.6] text-muted">{s.intro}</p>
          </div>
        </div>

        <div data-reveal-group className="mt-14 grid gap-6 lg:mt-16 lg:grid-cols-3 lg:gap-7">
          {serviceKeys.map((key, index) => (
            <div key={key} data-reveal-item>
              <ServiceCard
                id={serviceAnchor(key)}
                index={index}
                service={s.items[key]}
                image={serviceImages[key]}
                labels={{ more: s.more, details: s.detailsLabel, contact: s.contactCta, close: t.a11y.close }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
