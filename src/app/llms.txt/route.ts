import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { mapsLinkUrl, site, type ServiceKey } from "@/content/site";

// Plain-language company summary for AI assistants and answer engines (https://llmstxt.org)
export const dynamic = "force-static";

const serviceKeys: ServiceKey[] = ["development", "leasing", "management"];

export function GET() {
  const sr = getDictionary("sr");
  const en = getDictionary("en");
  const { street, postalCode, city, district } = site.address;

  const body = [
    `# ${site.name}`,
    "",
    `> ${en.meta.description}`,
    "",
    `${site.name} (${site.url}) is a Belgrade-based company that develops, reconstructs, leases and manages contemporary commercial and office spaces, and provides tenants with complete technical and logistical support.`,
    "",
    "## Services",
    ...serviceKeys.map((key) => `- **${en.services.items[key].title}** — ${en.services.items[key].long}`),
    "",
    "## Company details",
    `- Legal name / brand: ${site.name}`,
    `- Address: ${street}, ${postalCode} ${city} (${district}), Serbia`,
    `- Email: ${site.email}`,
    `- Tax ID (PIB): ${site.pib}`,
    `- Company registration number (MB): ${site.registrationNumber}`,
    `- Map: ${mapsLinkUrl}`,
    "",
    "## Pages",
    ...locales.map((lang) => {
      const t = getDictionary(lang);
      return `- [${t.meta.title}](${site.url}/${lang}): ${t.meta.description}`;
    }),
    "",
    "## Opis na srpskom",
    sr.meta.description,
    "",
    ...serviceKeys.map((key) => `- **${sr.services.items[key].title}** — ${sr.services.items[key].long}`),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}
