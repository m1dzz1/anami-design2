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
  heroBackground: { src: "/images/anami-hero-background.webp", width: 1672, height: 941, blur: "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADQAQCdASoMAAcAAoBCJYwCdADbr964sAD++KEXt15YPuNPSBee/G5XSmZ4Qmmlx6nMF+ghdGnmRmVdUXzMAA==" },
  heroFeatured: { src: "/images/anami-hero-featured-building.webp", width: 1448, height: 1086, blur: "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAADQAQCdASoMAAkAAoBCJQBOgBuEYO5BkAD+75ipoPTILCuBXovCayokFmWfz1GoRFVTJLqXfOetuWXwz/2nvjn3Pn8n8HPfQsM6POTTFbv4MAAA" },
  aboutMain: { src: "/images/anami-about-main-building.webp", width: 1122, height: 1402, blur: "data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAAAwAgCdASoKAAwAAoBCJYgCdAEXfn5bUZICgAD+75pb5yTrjnYL+ALHHgHeEdb3HwcLWIhV5rxFy7BLeY4+pU7wXPqKzEUfLRcAvg4YbHAFS+KSHHrAeFhAj5BQc/WgAAA=" },
  aboutNature: { src: "/images/anami-about-nature-background.webp", width: 1403, height: 1121, blur: "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADwAQCdASoMAAoAAoBCJYgCdAC9ighZRLAA/s4E/LHHfyslfXy6Lwq1UI5kRgtQlcA0BtY3SAgkvJc19hK3bm1x7UjowJue2neMBkwAAAA=" },
  aboutInterior: { src: "/images/anami-about-office-interior.webp", width: 1536, height: 1024, blur: "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAADwAQCdASoMAAgAAoBCJYgCdADcrrCF3gAA/k0OMvWlr8PQwMhS9bU7t+Gm9zAUi5fn8mqqs4tcrPi6bno2YY8NEqxgigI+2mOoqAAA" },
  serviceDevelopment: { src: "/images/anami-service-development.webp", width: 1672, height: 941, blur: "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAAAwAgCdASoMAAcAAoBCJZgCdH8AE7354bjEAAD+zRnhEHRMX0+XMS09OGQOV6/EXYxN1TYFmy2Ozvd8ABwvJfqyRh2dJF91wuqKjCgo4LK4UItvYEzxgAAA" },
  serviceLeasing: { src: "/images/anami-service-leasing.webp", width: 1448, height: 1086, blur: "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAACwAQCdASoMAAkAAoBCJZgCdADg+Y46APvrD9ZUf7UrlEfge1cidCw7r4u1yN971lv7z1rzFEvXM0NaOYTwn3/a14tOyaw4CPIWlUutsLCyZnEYskvcAAAA" },
  serviceManagement: { src: "/images/anami-service-management.webp", width: 1448, height: 1086, blur: "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAAAQAgCdASoMAAkAAoBCJZgCdAYstae1AF3AAP7mzIX6EfDYfFqI9Wfs3CAQbQi5forw+D280oeSqfgw8RNXnMkb5zXpNZKbchq9Ns5ygCbc+ZV6jTOJ85AA" },
  // Static preview rendered from OpenStreetMap tiles (© OpenStreetMap contributors, ODbL) — centred on site.map
  map: { src: "/images/anami-map.webp", width: 1600, height: 1000, blur: "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAADwAQCdASoMAAgAAoBCJZQC7AELXYpkCAAA/vfweChSRlgfOztsM/WB7GYfQAAA" },
  editorial: { src: "/images/anami-editorial-architecture.webp", width: 1672, height: 941, blur: "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADwAQCdASoMAAcAAoBCJQBOgBu1VI/SYoAA/vb41SCfLbund0FWPxRNwSSc1219TssynHk8Ap00Ql1IPVPL3lBo/DKV/eCoaXQDssIbzQAAAA==" },
} as const;

/** Social-share image (1200×630, cropped from the hero photograph). */
export const ogImage = { src: "/images/anami-og.jpg", width: 1200, height: 630 } as const;

export type ServiceKey = "development" | "leasing" | "management";

export const serviceImages: Record<ServiceKey, (typeof images)[keyof typeof images]> = {
  development: images.serviceDevelopment,
  leasing: images.serviceLeasing,
  management: images.serviceManagement,
};

export const serviceAnchor = (key: ServiceKey) => `service-${key}`;
