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
  editorial: "values",
  contact: "contact",
} as const;

export const images = {
  heroBackground: { src: "/images/anami-hero-lobby.webp", width: 2400, height: 1800, blur: "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAAAQAgCdASoMAAkAA4BaJZACdAYs3c9G/vpAAP724yYnWIg0X1u3OjQzZ/fihN1yVB9b9zAndoM7KbddzVE0StF12EwGvidnlM4DlHn6IAAAAA==" },
  // Portrait crop of the same lobby photograph, served to phones (art direction in Hero.tsx)
  heroBackgroundMobile: { src: "/images/anami-hero-lobby-mobile.webp", width: 1200, height: 1600, blur: "data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAADwAQCdASoMABAAA4BaJQBWACPtDMag+OAA/vNe6b2Q6AZb0Y3kz7uPo4OqNLNO4X0W+2S2ovFN49bUu+Va48TOfW5UejtGY9wBA2M86CGOV3Zn2yDQxRtcUmiMALSQIAA=" },
  heroFeatured: { src: "/images/anami-entrance.webp", width: 1600, height: 980, blur: "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAAAwAgCdASoMAAcAA4BaJYwCdEf/geH1pdOAWAD+hBovN7dxS1hRlJJ2esJcCR7yrmlCWTuKSZfLAg44nyGDcCCfNxe0EDUGJ4AAAA==" },
  aboutMain: { src: "/images/anami-reception.webp", width: 1200, height: 1500, blur: "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAACwAQCdASoMAA8AA4BaJQAAS6SHAEYAAP7QaIuLBknzHSUDBwigcG656XgL7PxwCrjMCMJ34h83Y33Qg1uP7ZL8qXX5YgqFWIFPAZAmLQwAAA==" },
  aboutNature: { src: "/images/anami-about-nature-background.webp", width: 1403, height: 1121, blur: "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADwAQCdASoMAAoAAoBCJYgCdAC9ighZRLAA/s4E/LHHfyslfXy6Lwq1UI5kRgtQlcA0BtY3SAgkvJc19hK3bm1x7UjowJue2neMBkwAAAA=" },
  aboutInterior: { src: "/images/anami-office-open.webp", width: 1600, height: 1200, blur: "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAACQAQCdASoMAAkAA4BaJZQAAmaq0oAA+FGFEF0xqg3EwufdH5Ec9ji0kwyc191XlaatZ3Dldx1JY/iXTmG/dCnNZl+gQAAA" },
  serviceDevelopment: { src: "/images/anami-service-development.webp", width: 1672, height: 941, blur: "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAAAwAgCdASoMAAcAAoBCJZgCdH8AE7354bjEAAD+zRnhEHRMX0+XMS09OGQOV6/EXYxN1TYFmy2Ozvd8ABwvJfqyRh2dJF91wuqKjCgo4LK4UItvYEzxgAAA" },
  serviceLeasing: { src: "/images/anami-office-terrace.webp", width: 1600, height: 1200, blur: "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAADwAQCdASoMAAkAA4BaJZQAAxPwpDfmjTAA/fBfGPwloxoGqW4Bp8DQWdOeIpR0KmkQIQkiyYnW2xziefwueKDiRN8P4gAA" },
  serviceManagement: { src: "/images/anami-office-corridor.webp", width: 1600, height: 1200, blur: "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAADwAQCdASoMAAkAA4BaJQBdgCHhPEDPQ9gA/PYDpIQDx4E5GgLtTuStMXOyTrlYi3F70gd6kPb3PnHKVj6Ww+AA" },
  // Static preview rendered from OpenStreetMap tiles (© OpenStreetMap contributors, ODbL) — centred on site.map
  map: { src: "/images/anami-map.webp", width: 1600, height: 1000, blur: "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAADwAQCdASoMAAgAAoBCJZQC7AELXYpkCAAA/vfweChSRlgfOztsM/WB7GYfQAAA" },
  editorial: { src: "/images/anami-editorial-architecture.webp", width: 1672, height: 941, blur: "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADwAQCdASoMAAcAAoBCJQBOgBu1VI/SYoAA/vb41SCfLbund0FWPxRNwSSc1219TssynHk8Ap00Ql1IPVPL3lBo/DKV/eCoaXQDssIbzQAAAA==" },
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
