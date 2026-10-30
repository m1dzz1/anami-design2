/**
 * Blog posts (Serbian only). Linked from the footer, not from the main navigation.
 * A post is a list of blocks so the page can render headings and paragraphs without a Markdown parser.
 */
export type BlogBlock = { type: "h2"; text: string } | { type: "p"; text: string };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD) */
  published: string;
  keywords: string[];
  blocks: BlogBlock[];
};

export const blog = {
  label: "Blog",
  title: "Blog o poslovnim prostorima u Beogradu | ANAMI",
  heading: "Blog",
  lead: "Tekstovi o zakupu, uređenju i održavanju poslovnih prostora u Beogradu.",
  description: "Saveti o zakupu poslovnog prostora u Beogradu: šta proveriti pre ugovora, kako se prostor uređuje po meri zakupca i ko održava zgradu.",
  readMore: "Pročitajte tekst",
  back: "Svi tekstovi",
  home: "Početna",
  cta: "Pošaljite upit za zakup prostora",
} as const;

export const posts: BlogPost[] = [
  {
    slug: "poslovni-prostori-beograd-sta-pitati-pre-zakupa",
    title: "Poslovni prostori u Beogradu: šta da pitate pre nego što potpišete zakup",
    description:
      "Pre zakupa poslovnog prostora u Beogradu pitajte u kakvom stanju ga dobijate, ko pravi raspored, ko održava zgradu i koliko je ugovor fleksibilan.",
    published: "2026-10-30",
    keywords: [
      "poslovni prostori Beograd",
      "poslovni prostori u Beogradu",
      "zakup poslovnog prostora Beograd",
      "izdavanje poslovnog prostora Beograd",
      "kancelarijski prostor Beograd",
      "poslovni prostor Zemun",
    ],
    blocks: [
      {
        type: "p",
        text: "Oglasi za poslovne prostore u Beogradu liče jedan na drugi: kvadratura, sprat, cena po kvadratu i fotografija praznog hodnika. Ono što odlučuje kako ćete u tom prostoru raditi narednih godina u oglasu skoro nikad ne piše. To saznate kad pitate, ili kad se prvi put nešto pokvari.",
      },
      { type: "h2", text: "U kakvom stanju dobijate prostor" },
      {
        type: "p",
        text: "Pod „poslovnim prostorom“ se nudi i gotova kancelarija sa podom, rasvetom i mrežom već na mestu, i siva faza u kojoj su beton i instalacije doneti do zida. Razlika u novcu i vremenu je velika, a iz oglasa često nije jasno ko je plaća. Pitajte šta tačno dobijate na dan useljenja i ko snosi trošak uređenja. Ako ga snosite vi, pitajte i šta biva sa tim ulaganjem kad ugovor istekne.",
      },
      { type: "h2", text: "Da li se raspored pravi po vama" },
      {
        type: "p",
        text: "Prostor koji je uredio prethodni zakupac odgovara njegovom poslu, ne vašem. Tim koji ceo dan provodi na telefonu traži drugačiji raspored od male kancelarije u koju klijenti stalno dolaze na sastanke. Zakupodavac kome je stalo do dugog zakupa prvo pita koliko vas ima i kako radite, pa tek onda crta.",
      },
      {
        type: "p",
        text: "Sa magacinom je slično. Prilaz za kamion i pod koji nosi teret ne mogu se naknadno dodati kao pregradni zid, pa to proverite pre nego što krenete u priču o ceni.",
      },
      { type: "h2", text: "Ko održava zgradu" },
      {
        type: "p",
        text: "Ovo pitanje se najčešće preskoči. Kad stane klima usred jula, zakupac mora da zna koga zove. Negde je to upravnik zgrade, negde vlasnik, a negde niko, pa zakupac sam traži majstore i sam se sa njima dogovara. Pitajte da li postoji jedna osoba za sve što se tiče zgrade i šta je od održavanja uračunato u zakup.",
      },
      { type: "h2", text: "Koliko je ugovor fleksibilan" },
      {
        type: "p",
        text: "Firma koja raste za dve godine možda neće stati u prostor koji danas zakupljuje. Proverite da li se kvadratura i trajanje ugovora dogovaraju ili dobijate gotov obrazac na potpis, i šta biva ako vam pre isteka ugovora zatreba više mesta.",
      },
      { type: "h2", text: "Kako to radi ANAMI" },
      {
        type: "p",
        text: "ANAMI izdaje kancelarije i poslovne prostore u Beogradu, u sopstvenim objektima i u objektima drugih vlasnika. Prostor najčešće preuzimamo u sivoj fazi, a raspored i enterijer radimo po meri zakupca pre nego što se useli. Uslove zakupa, od kvadrature do trajanja ugovora, dogovaramo sa svakim zakupcem posebno. Kad se zakupac useli, zgradu održava naš tim, a zakupac ima jedan kontakt za sva pitanja o zgradi.",
      },
      {
        type: "p",
        text: "Ako tražite poslovni prostor u Beogradu, napišite nam koliko vas ima i od kada vam treba. Javićemo vam se. Nalazimo se u Zemunu, u Ulici cara Dušana 266.",
      },
    ],
  },
];

export const getPost = (slug: string) => posts.find((post) => post.slug === slug);

export const blogPath = (slug?: string) => (slug ? `/sr/blog/${slug}` : "/sr/blog");

const dateFormat = new Intl.DateTimeFormat("sr-Latn-RS", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export const formatDate = (iso: string) => dateFormat.format(new Date(`${iso}T00:00:00Z`));
