import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { mapsLinkUrl, sectionIds, site, type ServiceKey } from "@/content/site";
import { blogPath, posts } from "@/content/blog";

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
    `${site.name} (${site.url}) is a company from ${district}, Belgrade (Serbia) that leases office and commercial space in Belgrade, in its own buildings and in buildings of other owners. It also adapts, reconstructs and builds commercial buildings (its own and for other owners), and maintains the buildings it manages for tenants.`,
    "",
    "## Key facts",
    `- ${site.name} leases offices and commercial space in Belgrade, in its own buildings and in buildings of other owners.`,
    "- Lease terms (floor area, contract length) are agreed with each tenant; the interior is fitted out for the tenant before move-in.",
    "- Space can be taken over as a grey shell or as a building for reconstruction, then goes through design, adaptation and interior fit-out.",
    "- Reconstruction and new construction of commercial buildings, built to current construction standards.",
    "- Technical and infrastructure maintenance, logistics and tenant support through a single point of contact.",
    `- Enquiries: ${site.email}, ${site.phone.display} or the contact form at ${site.url}/sr#${sectionIds.contact} (Serbian) / ${site.url}/en#${sectionIds.contact} (English).`,
    "",
    "## Services",
    ...serviceKeys.map((key) => `- **${en.services.items[key].title}** — ${en.services.items[key].long}`),
    "",
    "## Company details",
    `- Legal name / brand: ${site.name}`,
    `- Address: ${street}, ${postalCode} ${city} (${district}), Serbia`,
    `- Email: ${site.email}`,
    `- Phone: ${site.phone.e164} (${site.phone.display})`,
    `- Tax ID (PIB): ${site.pib}`,
    `- Company registration number (MB): ${site.registrationNumber}`,
    `- Map: ${mapsLinkUrl}`,
    "",
    "## Pages",
    ...locales.map((lang) => {
      const t = getDictionary(lang);
      return `- [${t.meta.title}](${site.url}/${lang}): ${t.meta.description}`;
    }),
    ...posts.map((post) => `- [${post.title}](${site.url}${blogPath(post.slug)}) (blog, Serbian): ${post.description}`),
    "",
    "## Poslovni prostori u Beogradu (srpski)",
    sr.meta.description,
    "",
    `${site.name} izdaje kancelarije i poslovne prostore u Beogradu, u sopstvenim objektima i u objektima drugih vlasnika. Radi adaptacije i rekonstrukcije postojećih poslovnih objekata i gradi nove. Kontakt: ${site.email}, ${site.phone.display}.`,
    "",
    ...serviceKeys.map((key) => `- **${sr.services.items[key].title}** — ${sr.services.items[key].long}`),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}
