import type { ReactNode } from "react";
import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { sectionIds } from "@/content/site";
import Logo from "./Logo";
import Footer from "./Footer";

/** Frame for the blog pages: a plain top bar back to the home page, the content on a light surface, the site footer. */
export default function BlogShell({ children }: { children: ReactNode }) {
  const t = getDictionary("sr");

  return (
    <>
      <a href="#main" className="skip-link">
        {t.a11y.skipToContent}
      </a>
      <header id="top" className="bg-petrol-deep text-white">
        <div className="container-x flex min-h-[var(--nav-h)] items-center justify-between gap-6">
          <Link href="/sr" aria-label={t.a11y.homeLink} className="text-[1.9rem]">
            <Logo variant="mono" />
          </Link>
          <a href={`/sr#${sectionIds.contact}`} className="link-line inline-flex min-h-11 items-center text-[0.875rem] text-white/85 hover:text-white">
            {t.nav.contact}
          </a>
        </div>
      </header>
      <main id="main" className="on-light bg-mist text-ink">
        {children}
      </main>
      <Footer lang="sr" t={t} onHome={false} />
    </>
  );
}
