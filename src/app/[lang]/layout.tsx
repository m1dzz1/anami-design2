import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import { isLocale, locales, localeMeta, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { ogImage, site } from "@/content/site";
import "../globals.css";

// Self-hosted (Latin + Latin Extended subsets of the Google Fonts originals) so neither dev nor build
// depends on reaching fonts.googleapis.com
const barlowCondensed = localFont({
  src: [
    { path: "../fonts/BarlowCondensed-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/BarlowCondensed-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/BarlowCondensed-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-barlow-condensed",
  display: "swap",
  fallback: ["Arial Narrow", "Arial", "sans-serif"],
});

const manrope = localFont({
  // Variable font — one file covers every weight instead of five
  src: "../fonts/Manrope-Variable.woff2",
  weight: "200 800",
  variable: "--font-manrope",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export const viewport: Viewport = {
  themeColor: "#183A40",
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
      className={`${barlowCondensed.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
