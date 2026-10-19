import { notFound } from "next/navigation";
import { isLocale, localeMeta } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { mapsLinkUrl, ogImage, serviceAnchor, site, type ServiceKey } from "@/content/site";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Transformation from "@/components/Transformation";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Motion from "@/components/Motion";
import Intro, { INTRO_SCRIPT } from "@/components/Intro";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  const pageUrl = `${site.url}/${lang}`;
  const orgId = `${site.url}/#organization`;
  const serviceKeys: ServiceKey[] = ["development", "leasing", "management"];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: site.name,
        alternateName: "Anami",
        url: site.url,
        logo: { "@type": "ImageObject", url: `${site.url}/icon-512.png`, width: 512, height: 512 },
        image: `${site.url}${ogImage.src}`,
        email: site.email,
        description: t.meta.description,
        slogan: `${t.hero.titleBrand} ${t.hero.titleLine1} ${t.hero.titleLine2}`,
        keywords: t.meta.keywords.join(", "),
        knowsAbout: serviceKeys.map((key) => t.services.items[key].title),
        taxID: site.pib,
        vatID: site.pib,
        identifier: { "@type": "PropertyValue", propertyID: "MB", value: site.registrationNumber },
        address: {
          "@type": "PostalAddress",
          streetAddress: site.address.street,
          postalCode: site.address.postalCode,
          addressLocality: `${site.address.city} (${site.address.district})`,
          addressCountry: site.address.countryCode,
        },
        location: {
          "@type": "Place",
          name: `${site.name} — ${site.address.street}, ${site.address.district}`,
          hasMap: mapsLinkUrl,
          geo: { "@type": "GeoCoordinates", latitude: site.map.lat, longitude: site.map.lng },
          address: { "@type": "PostalAddress", streetAddress: site.address.street, postalCode: site.address.postalCode, addressLocality: site.address.city, addressCountry: site.address.countryCode },
        },
        areaServed: [
          { "@type": "City", name: site.address.city },
          { "@type": "Country", name: lang === "sr" ? "Srbija" : "Serbia" },
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: site.email,
          availableLanguage: ["sr", "en"],
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: t.services.titleLine1 + " " + t.services.titleLine2,
          itemListElement: serviceKeys.map((key) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              "@id": `${pageUrl}#${serviceAnchor(key)}`,
              name: t.services.items[key].title,
              description: t.services.items[key].long,
              serviceType: t.services.items[key].title,
              provider: { "@id": orgId },
              areaServed: { "@type": "City", name: site.address.city },
            },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        publisher: { "@id": orgId },
        inLanguage: ["sr-Latn", "en"],
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: t.meta.title,
        description: t.meta.description,
        inLanguage: localeMeta[lang].htmlLang,
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": orgId },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${site.url}${ogImage.src}`,
          width: ogImage.width,
          height: ogImage.height,
        },
      },
    ],
  };

  return (
    <>
      {/* Must run before the intro overlay is parsed, so the first paint already knows whether to show it */}
      <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      <Intro />
      <a href="#main" className="skip-link">
        {t.a11y.skipToContent}
      </a>
      <Header lang={lang} t={t} />
      <main id="main">
        <Hero t={t} />
        <About t={t} />
        <Transformation t={t} />
        <Services t={t} />
        <Contact lang={lang} t={t} />
      </main>
      <Footer lang={lang} t={t} />
      <Motion lang={lang} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
