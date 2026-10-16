/**
 * Language-independent company data and assets.
 * Replace values here when official data changes — components read from this file only.
 */
export const site = {
  name: "ANAMI",
  url: "https://anami.rs",
  email: "office@anami.rs",
  // Telephone intentionally omitted — not yet confirmed by the client.
  address: {
    street: "Cara Dušana 266",
    postalCode: "11080",
    city: "Beograd",
    district: "Zemun",
    countryCode: "RS",
  },
  pib: "112788731",
  registrationNumber: "21739707",
  bank: "ProCredit Bank",
  bankAccount: "220-0000000161081-06",
  map: {
    query: "Cara Dušana 266, 11080 Zemun, Beograd, Srbija",
    // Approximate building location (OpenStreetMap / Nominatim)
    lat: 44.86107,
    lng: 20.37583,
  },
} as const;

export const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(site.map.query)}&z=15&output=embed`;
export const mapsLinkUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.map.query)}`;

/** Section anchors — shared by both languages so switching language keeps the position. */
export const sectionIds = {
  home: "home",
  about: "about",
  services: "services",
  transformation: "transformation",
  editorial: "values",
  contact: "contact",
} as const;

export const images = {
  heroBackground: { src: "/images/anami-hero-lobby.webp", width: 2400, height: 1800, blur: "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAAAQAgCdASoMAAkAA4BaJZACdAYs3c9G/vpAAP724yYnWIg0X1u3OjQzZ/fihN1yVB9b9zAndoM7KbddzVE0StF12EwGvidnlM4DlHn6IAAAAA==" },
  // Portrait crop of the same lobby photograph, served to phones (art direction in Hero.tsx)
  heroBackgroundMobile: { src: "/images/anami-hero-lobby-mobile.webp", width: 1200, height: 1600, blur: "data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAADwAQCdASoMABAAA4BaJQBWACPtDMag+OAA/vNe6b2Q6AZb0Y3kz7uPo4OqNLNO4X0W+2S2ovFN49bUu+Va48TOfW5UejtGY9wBA2M86CGOV3Zn2yDQxRtcUmiMALSQIAA=" },
  heroFeatured: { src: "/images/anami-entrance.webp", width: 1600, height: 980, blur: "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAAAwAgCdASoMAAcAA4BaJYwCdEf/geH1pdOAWAD+hBovN7dxS1hRlJJ2esJcCR7yrmlCWTuKSZfLAg44nyGDcCCfNxe0EDUGJ4AAAA==" },
  aboutMain: { src: "/images/anami-reception.webp", width: 1200, height: 1500, blur: "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAACwAQCdASoMAA8AA4BaJQAAS6SHAEYAAP7QaIuLBknzHSUDBwigcG656XgL7PxwCrjMCMJ34h83Y33Qg1uP7ZL8qXX5YgqFWIFPAZAmLQwAAA==" },
  // Detail from the stair landing above the reception — banana plant against polished plaster
  aboutNature: { src: "/images/anami-plant-detail.webp", width: 1100, height: 1200, blur: "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAADQAQCdASoLAAwAA4BaJQBOgBuG5IsOgADyRG3k8oZmN6NqyoyByDdA7O98M0HGqaGmGZA+sEmixQtPivKFSGjT8AmWUAAA" },
  aboutInterior: { src: "/images/anami-office-open.webp", width: 1600, height: 1200, blur: "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAACQAQCdASoMAAkAA4BaJZQAAmaq0oAA+FGFEF0xqg3EwufdH5Ec9ji0kwyc191XlaatZ3Dldx1JY/iXTmG/dCnNZl+gQAAA" },
  serviceDevelopment: { src: "/images/anami-building-facade.webp", width: 1600, height: 1200, blur: "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAACwAQCdASoMAAkAA4BaJYgCdADbARHgAP4moINxYiAdeQiaYaof14df+FSHg09aOkfBn9oKMAQ9XzjISot3coAA" },
  serviceLeasing: { src: "/images/anami-office-terrace.webp", width: 1600, height: 1200, blur: "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAADwAQCdASoMAAkAA4BaJZQAAxPwpDfmjTAA/fBfGPwloxoGqW4Bp8DQWdOeIpR0KmkQIQkiyYnW2xziefwueKDiRN8P4gAA" },
  serviceManagement: { src: "/images/anami-corridor.webp", width: 1448, height: 1086, blur: "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAADwAQCdASoMAAkAA4BaJQBdgCPQTa9wsoAA/PYDpS+wTpfWQoYWi+caoeM04usFuBFKEVM8B7No4YoVpo75h7MkLMoAAA==" },
  // Static preview rendered from OpenStreetMap tiles (© OpenStreetMap contributors, ODbL) — centred on site.map
  map: { src: "/images/anami-map.webp", width: 1600, height: 1000, blur: "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAADwAQCdASoMAAgAAoBCJZQC7AELXYpkCAAA/vfweChSRlgfOztsM/WB7GYfQAAA" },
  editorial: { src: "/images/anami-office-green-wall.webp", width: 1800, height: 1260, blur: "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADQAQCdASoMAAgAA4BaJZQCdADdKjUpUAD0TCv7KYUwbZRtsaUmHkEOBfgrA1R0N/tlQXUE5d1mTnTJAYYAAA==" },
} as const;

/**
 * Scroll-driven image sequence: the same office floor going from a bare concrete shell to a finished workspace.
 * Extracted losslessly from the source video (img/ambient-video) and encoded once at high quality:
 * `lg` = 1920×1080 frames for landscape screens, `sm` = 864×1080 portrait crops for phones.
 */
export const transformationFrames = {
  count: 81,
  path: (set: "lg" | "sm", index: number) => `/images/transformation/${set}/${String(index + 1).padStart(3, "0")}.webp`,
  lg: { width: 1920, height: 1080 },
  sm: { width: 864, height: 1080 },
} as const;

/** Social-share image (1200×630, cropped from the hero lobby photograph). */
export const ogImage = { src: "/images/anami-og.jpg", width: 1200, height: 630 } as const;

export type ServiceKey = "development" | "leasing" | "management";

export const serviceImages: Record<ServiceKey, (typeof images)[keyof typeof images]> = {
  development: images.serviceDevelopment,
  leasing: images.serviceLeasing,
  management: images.serviceManagement,
};

export const serviceAnchor = (key: ServiceKey) => `service-${key}`;
