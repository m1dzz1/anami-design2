import { Building2, ExternalLink, FileText, Landmark, Mail, MapPin, Phone } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { mapsLinkUrl, sectionIds, site } from "@/content/site";
import ContactForm from "./ContactForm";
import LocationMap from "./LocationMap";
import FacadeSketch from "./FacadeSketch";

export default function Contact({ lang, t }: { lang: Locale; t: Dictionary }) {
  const c = t.contact;

  const info = [
    {
      icon: MapPin,
      label: c.info.address,
      body: c.info.addressLines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      )),
    },
    {
      icon: Mail,
      label: c.info.email,
      body: (
        <a
          href={`mailto:${site.email}`}
          className="inline-flex min-h-11 items-center text-white underline decoration-teal-light/50 underline-offset-4 transition-colors hover:decoration-teal-light"
        >
          {site.email}
        </a>
      ),
    },
    {
      icon: Phone,
      label: c.info.phone,
      body: (
        <a
          href={`tel:${site.phone.e164}`}
          className="inline-flex min-h-11 items-center whitespace-nowrap text-white tabular-nums underline decoration-teal-light/50 underline-offset-4 transition-colors hover:decoration-teal-light"
        >
          {site.phone.display}
        </a>
      ),
    },
    {
      icon: FileText,
      label: c.info.pib,
      body: (
        <>
          <span className="font-semibold text-white">{c.info.pib}:</span> {site.pib}
        </>
      ),
    },
    {
      icon: Building2,
      label: c.info.mb,
      body: (
        <>
          <span className="font-semibold text-white">{c.info.mb}:</span> {site.registrationNumber}
        </>
      ),
    },
    {
      icon: Landmark,
      label: site.bank,
      body: (
        <>
          <span className="block">{c.info.bank}</span>
          {" "}
          <span className="block whitespace-nowrap font-medium tabular-nums text-white">{site.bankAccount}</span>
        </>
      ),
    },
  ];

  return (
    <section
      id={sectionIds.contact}
      aria-labelledby="contact-title"
      className="relative overflow-hidden bg-[linear-gradient(180deg,var(--petrol)_0%,#163338_100%)] py-[var(--section-y)]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 text-teal-light">
        <FacadeSketch variant="outline" className="max-md:top-[14rem] md:top-[4%]" />
      </div>

      <div className="container-x relative">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,29rem)] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] xl:gap-24">
          <div>
            <div data-reveal-text>
              <p className="kicker text-teal-light">{c.kicker}</p>
              <h2 id="contact-title" className="display display-lg mt-6 text-white">
                <span className="block">{c.titleLine1}</span>
                {" "}
                <span className="block text-teal-light">{c.titleLine2}</span>
              </h2>
              <span aria-hidden="true" className="rule mt-7 text-teal-light/70" />
              <div className="mt-6 max-w-[30rem] space-y-4 text-[1.0625rem] leading-[1.6] text-white/88">
                {c.lead.map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </div>
            </div>

            <div data-reveal-text className="mt-12">
              <h3 className="sr-only">{c.info.title}</h3>
              <address className="not-italic">
                <dl data-stagger className="grid gap-x-10 gap-y-6 text-[0.9375rem] leading-[1.55] text-white/80 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {info.map(({ icon: Icon, label, body }) => (
                    <div key={label} className="flex gap-4">
                      <dt className="shrink-0 pt-0.5">
                        <Icon aria-hidden="true" size={20} strokeWidth={1.4} className="text-teal-light" />
                        <span className="sr-only">{label}</span>
                      </dt>
                      <dd>{body}</dd>
                    </div>
                  ))}
                </dl>
              </address>
            </div>
          </div>

          <div data-reveal-text className="lg:pt-4">
            <ContactForm lang={lang} t={c.form} />
          </div>
        </div>

        {/* Map */}
        <div data-reveal-text className="relative mt-16 lg:mt-20">
        <div className="relative aspect-[4/3.4] overflow-hidden border border-white/20 bg-petrol-mid sm:aspect-[16/8] lg:aspect-[16/5.5]">
          <LocationMap title={c.map.title} imageAlt={c.map.imageAlt} activateLabel={c.map.activate} />
          <div className="on-light pointer-events-none absolute left-2 top-2 flex max-w-[calc(100%-1rem)] items-start gap-2.5 bg-mist-soft px-4 py-3.5 text-[0.8125rem] leading-[1.35] text-ink shadow-md">
            <MapPin aria-hidden="true" size={20} strokeWidth={0} fill="var(--anami-teal)" className="shrink-0" />
            <span>
              {site.address.street}
              <br />
              {c.info.addressLines[1].replace(/,$/, "")}
              <br />
              {c.info.addressLines[2]}
            </span>
          </div>
        </div>
          <a
            href={mapsLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-petrol px-4 sm:absolute sm:bottom-3 sm:right-3 sm:mt-0 sm:border-transparent text-[0.75rem] font-semibold text-white transition-colors hover:bg-teal"
          >
            {c.map.open}
            <span className="sr-only"> ({c.map.newTab})</span>
            <ExternalLink aria-hidden="true" size={15} strokeWidth={1.75} />
          </a>
        </div>
      </div>
    </section>
  );
}
