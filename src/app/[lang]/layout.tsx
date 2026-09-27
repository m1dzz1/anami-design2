import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Barlow_Condensed, Manrope } from "next/font/google";
import { isLocale, locales, localeMeta, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { ogImage, site } from "@/content/site";
import "../globals.css";

const display = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export const viewport: Viewport = {
  themeColor: "#102A24",
  colorScheme: "dark light",
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  const url = `${site.url}/${lang}`;

  return {
    metadataBase: new URL(site.url),
    title: t.meta.title,
    description: t.meta.description,
    keywords: t.meta.keywords,
    applicationName: site.name,
    authors: [{ name: site.name, url: site.url }],
    creator: site.name,
    publisher: site.name,
    category: "business",
    formatDetection: { telephone: false, address: false, email: false },
    alternates: {
      canonical: url,
      languages: {
        "sr-RS": `${site.url}/sr`,
        en: `${site.url}/en`,
        "x-default": `${site.url}/sr`,
      },
    },
    openGraph: {
      type: "website",
      url,
      siteName: site.name,
      title: t.meta.title,
      description: t.meta.description,
      locale: localeMeta[lang].ogLocale,
      alternateLocale: locales.filter((l) => l !== lang).map((l) => localeMeta[l].ogLocale),
      images: [
        {
          url: ogImage.src,
          width: ogImage.width,
          height: ogImage.height,
          alt: t.meta.ogAlt,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
      images: [{ url: ogImage.src, alt: t.meta.ogAlt }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    other: {
      "geo.region": "RS-00",
      "geo.placename": `${site.address.city}, ${site.address.district}`,
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html
      lang={localeMeta[lang as Locale].htmlLang}
      data-scroll-behavior="smooth"
      className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
