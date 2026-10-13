# ANAMI — anami.rs

Bilingual (SR / EN) single-page corporate website for ANAMI.
Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · GSAP · Lucide React.

```bash
npm install
npm run dev      # http://localhost:3000  →  redirects to /sr
npm run build && npm start
```

## Structure

```
img/anami-design-reference.png                master visual reference (not deployed)
img/                                          original PNG masters (renamed, untouched) + design reference
public/images/*.webp                          optimized production assets (next/image serves AVIF/WebP variants)
src/app/[lang]/                               localized root layout + page (/sr, /en), metadata, hreflang
src/app/api/contact/route.ts                  contact form endpoint (validation, spam protection, email)
src/app/sitemap.ts, robots.ts, manifest.ts, icon.svg, apple-icon.png
src/app/llms.txt/route.ts                     plain-language company summary for AI assistants (AEO)
src/components/                               one component per section (Header, Hero, About, Services, Editorial, Contact, Footer)
src/content/site.ts                           company data, image paths, section anchors — language independent
src/i18n/dictionaries/{sr,en}.ts              all visible copy, manually translated (sr.ts defines the shape)
src/lib/contact-validation.ts                 validation shared by client and server
src/app/globals.css                           design tokens (colors, fonts, spacing) + component styles
```

## Brand tokens

The colors are provisional. They are defined once in `src/app/globals.css` (`--anami-ink`, `--anami-forest`,
`--anami-green`, `--anami-mint`, `--anami-mist`). Change them there when the official guidelines arrive.
The temporary wordmark lives in `src/components/Logo.tsx`. Replace its contents with the official SVG logo.

## Images

| File | Use |
|---|---|
| anami-hero-lobby (+ -mobile portrait crop) | Hero fullscreen background (art-directed `<picture>` in Hero.tsx) |
| anami-entrance | Hero glass panel |
| anami-reception | About — main image |
| anami-about-nature-background | About — trees/sky, behind the composition |
| anami-office-open | About — overlapping interior |
| anami-service-development / anami-office-terrace / anami-office-corridor | Service cards (development / leasing / management) |
| anami-editorial-architecture | "Više od prostora" section |

Lobby, entrance, reception and office photos are real ANAMI photographs from the client (Drive: Anami Docs → Sajt →
Slike Zemun / Slike Progres), resized and re-encoded with EXIF/GPS stripped. The nature, development and editorial
images are still design placeholders.

## Pending third-party configuration

1. **Contact form email.** Copy `.env.example` to `.env.local` and set `RESEND_API_KEY` and `CONTACT_FROM_EMAIL`
   (a sender on a domain verified in Resend, e.g. `web@anami.rs`). Until then the form validates normally,
   but on submit it shows an honest "sending unavailable — write to office@anami.rs" message. It never shows a fake success.
   Spam protection: honeypot field, minimum fill time, and a per-IP rate limit (in-memory; use a shared store such as Upstash if deploying to multiple serverless instances).
2. **Telephone number.** Not provided. None is shown anywhere.
3. **Privacy policy / terms.** Not linked until that content exists.
4. **Map.** A static map (`public/images/anami-map.webp`, rendered from OpenStreetMap tiles, © OpenStreetMap contributors)
   shows instantly. The interactive Google Maps embed loads only when the visitor clicks it. The embed takes several
   seconds and keeps the browser's loading indicator spinning, and this approach also needs no cookie consent before the click.
   The map centre is `site.map.lat/lng` in `src/content/site.ts`. If the address changes, regenerate the image.
5. **Official logo and brand colors.** See "Brand tokens" above.

## WordPress migration notes

All copy is in `src/i18n/dictionaries`, and company data is in `src/content/site.ts`. Each section is a self-contained
component with a matching block in `globals.css`, so it can map 1:1 to a theme template part or a custom block.
