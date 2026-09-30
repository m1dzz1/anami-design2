import { Building2, FileText, Landmark, Mail, MapPin, ExternalLink } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { mapsLinkUrl, sectionIds, site } from "@/content/site";
import ContactForm from "./ContactForm";
import LocationMap from "./LocationMap";
import FacadeSketch from "./FacadeSketch";

export default function Contact({ lang, t }: { lang: Locale; t: Dictionary }) {
  const c = t.contact;

  return (
    <section
      id={sectionIds.contact}
      aria-labelledby="contact-title"
      className="on-light relative overflow-hidden bg-[linear-gradient(180deg,var(--anami-mist)_0%,#f4f8f3_100%)] py-20 text-ink sm:py-24 lg:py-28"
    >
      <FacadeSketch variant="contact" className="max-md:top-4 md:top-[4%]" />
      {/* Phones: soft mist veil on the left so the headline and intro read cleanly over the office */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] bg-[linear-gradient(90deg,rgb(237_243_236/0.9)_0%,rgb(237_243_236/0.75)_45%,rgb(237_243_236/0)_80%)] [mask-image:linear-gradient(180deg,#000_65%,transparent)] md:hidden"
      />

      <div className="container-x relative">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] xl:gap-16">
          <div>
            <p data-reveal-text className="kicker text-ink">
              {c.kicker}
            </p>
            <h2 id="contact-title" className="display display-lg mt-6">
              <span className="block overflow-hidden pb-[0.04em]"><span data-line className="block text-ink">{c.titleLine1}</span></span>
              <span className="block overflow-hidden pb-[0.04em]"><span data-line className="block text-green">{c.titleLine2}</span></span>
            </h2>
          </div>
          <p data-reveal-text className="max-w-[30rem] text-[1.0625rem] leading-[1.6] text-muted xl:pt-12">
            {c.lead}
          </p>
        </div>

        <div data-reveal-group className="mt-12 grid gap-12 lg:mt-14 md:grid-cols-2 md:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,1.15fr)] xl:gap-14">
          {/* Form */}
          <div data-reveal-item>
            <ContactForm lang={lang} t={c.form} />
          </div>

          {/* Company information */}
          <div data-reveal-item>
            <h3 className="sr-only">{c.info.title}</h3>
            <address className="not-italic">
              <dl className="space-y-6 text-[0.9375rem] leading-[1.55] text-muted">
                <div className="flex gap-5">
                  <dt className="shrink-0 pt-0.5">
                    <MapPin aria-hidden="true" size={22} strokeWidth={1.4} className="text-ink" />
                    <span className="sr-only">{c.info.address}</span>
                  </dt>
                  <dd>
                    {c.info.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </dd>
                </div>
                <div className="flex gap-5">
                  <dt className="shrink-0 pt-0.5">
                    <Mail aria-hidden="true" size={22} strokeWidth={1.4} className="text-ink" />
                    <span className="sr-only">{c.info.email}</span>
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${site.email}`}
                      className="inline-block py-1 text-ink underline decoration-green/40 underline-offset-4 transition-colors hover:text-green hover:decoration-green"
                    >
                      {site.email}
                    </a>
                  </dd>
                </div>
                <div className="flex gap-5">
                  <dt className="shrink-0 pt-0.5">
                    <FileText aria-hidden="true" size={22} strokeWidth={1.4} className="text-ink" />
                    <span className="sr-only">{c.info.pib}</span>
                  </dt>
                  <dd>
                    <span className="font-semibold text-ink">{c.info.pib}:</span> {site.pib}
                  </dd>
                </div>
                <div className="flex gap-5">
                  <dt className="shrink-0 pt-0.5">
                    <Building2 aria-hidden="true" size={22} strokeWidth={1.4} className="text-ink" />
                    <span className="sr-only">{c.info.mb}</span>
                  </dt>
                  <dd>
                    <span className="font-semibold text-ink">{c.info.mb}:</span> {site.registrationNumber}
                  </dd>
                </div>
                <div className="flex gap-5">
                  <dt className="shrink-0 pt-0.5">
                    <Landmark aria-hidden="true" size={22} strokeWidth={1.4} className="text-ink" />
                    <span className="sr-only">{site.bank}</span>
                  </dt>
                  <dd>
                    <span className="block">{c.info.bank}</span>
                    <span className="block font-medium tabular-nums text-ink">{site.bankAccount}</span>
                  </dd>
                </div>
              </dl>
            </address>
          </div>

          {/* Map */}
          <div data-reveal-item data-reveal-clip className="relative md:col-span-2 xl:col-span-1">
            <div className="relative aspect-[4/3.3] overflow-hidden border border-white bg-mist-deep shadow-[0_24px_50px_-35px_rgb(16_42_36/0.5)] md:aspect-[16/7] xl:aspect-auto xl:h-full xl:min-h-[21rem]">
              <LocationMap title={c.map.title} imageAlt={c.map.imageAlt} activateLabel={c.map.activate} />
              <div className="pointer-events-none absolute left-2 top-2 flex min-h-[5.9rem] w-[17rem] max-w-[calc(100%-1rem)] items-start gap-2.5 bg-white px-4 py-3.5 text-[0.8125rem] leading-[1.35] text-ink shadow-md">
                <MapPin aria-hidden="true" size={22} strokeWidth={0} fill="var(--anami-green)" className="shrink-0" />
                <span>
                  {site.address.street}
                  <br />
                  {c.info.addressLines[1].replace(/,$/, "")}
                  <br />
                  {c.info.addressLines[2]}
                </span>
              </div>
              <a
                href={mapsLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-[0.75rem] font-semibold text-white transition-colors hover:bg-green"
              >
                {c.map.open}
                <span className="sr-only"> ({c.map.newTab})</span>
                <ExternalLink aria-hidden="true" size={15} strokeWidth={1.75} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
