import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { images, site } from "@/content/site";
import { blogPath, posts } from "@/content/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { "sr-RS": `${site.url}/sr`, en: `${site.url}/en` };
  const pages: MetadataRoute.Sitemap = locales.map((lang) => ({
    url: `${site.url}/${lang}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: lang === "sr" ? 1 : 0.9,
    alternates: { languages },
    images: Object.values(images).map((image) => `${site.url}${image.src}`),
  }));
  // The blog is Serbian only, so no hreflang alternates
  const blog: MetadataRoute.Sitemap = [
    { url: `${site.url}${blogPath()}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    ...posts.map((post) => ({
      url: `${site.url}${blogPath(post.slug)}`,
      lastModified: new Date(`${post.published}T00:00:00Z`),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
  return [...pages, ...blog];
}
