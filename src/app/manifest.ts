import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — Poslovni prostori`,
    short_name: site.name,
    description: "Razvoj, zakup i upravljanje savremenim poslovnim prostorima u Beogradu.",
    start_url: "/sr",
    scope: "/",
    display: "browser",
    lang: "sr-Latn",
    background_color: "#102A24",
    theme_color: "#102A24",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
