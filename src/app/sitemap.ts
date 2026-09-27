import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { images, site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { "sr-RS": `${site.url}/sr`, en: `${site.url}/en` };
  return locales.map((lang) => ({
    url: `${site.url}/${lang}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: lang === "sr" ? 1 : 0.9,
    alternates: { languages },
    images: Object.values(images).map((image) => `${site.url}${image.src}`),
  }));
}
