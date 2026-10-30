import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ogImage, sectionIds, site } from "@/content/site";
import { blog, blogPath, formatDate, getPost, posts } from "@/content/blog";
import BlogShell from "@/components/BlogShell";

// Serbian only, like the blog index
export function generateStaticParams() {
  return posts.map((post) => ({ lang: "sr", slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `${site.url}${blogPath(post.slug)}`;

  return {
    title: `${post.title} | ${site.name}`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: site.name,
      title: post.title,
      description: post.description,
      locale: "sr_RS",
      publishedTime: post.published,
      images: [{ url: ogImage.src, width: ogImage.width, height: ogImage.height, type: "image/jpeg" }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, images: [ogImage.src] },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { lang, slug } = await params;
  const post = getPost(slug);
  if (lang !== "sr" || !post) notFound();
  const url = `${site.url}${blogPath(post.slug)}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.description,
        datePublished: post.published,
        dateModified: post.published,
        inLanguage: "sr-Latn",
        keywords: post.keywords.join(", "),
        mainEntityOfPage: url,
        image: `${site.url}${ogImage.src}`,
        author: { "@type": "Organization", "@id": `${site.url}/#organization`, name: site.name, url: site.url },
        publisher: { "@type": "Organization", "@id": `${site.url}/#organization`, name: site.name, url: site.url },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: blog.home, item: `${site.url}/sr` },
          { "@type": "ListItem", position: 2, name: blog.label, item: `${site.url}${blogPath()}` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  return (
    <BlogShell>
      <article className="container-x py-[var(--section-y)]">
        <div className="mx-auto max-w-[44rem]">
          <a href={blogPath()} className="inline-flex min-h-11 items-center gap-2 text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-teal-deep">
            <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
            {blog.back}
          </a>
          <h1 className="display mt-6 text-[clamp(2.2rem,8vw,3.6rem)] text-ink">{post.title}</h1>
          <p className="mt-5 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-muted">
            {site.name} · <time dateTime={post.published}>{formatDate(post.published)}</time>
          </p>

          <div className="mt-10 text-[1.0625rem] leading-[1.75] text-ink">
            {post.blocks.map((block, index) =>
              block.type === "h2" ? (
                <h2 key={index} className="mt-12 font-display text-[clamp(1.5rem,4.5vw,2rem)] font-semibold uppercase leading-[1.1] text-teal-deep">
                  {block.text}
                </h2>
              ) : (
                <p key={index} className="mt-5 first:mt-0">
                  {block.text}
                </p>
              ),
            )}
          </div>

          <a href={`/sr#${sectionIds.contact}`} className="btn btn-primary mt-12">
            {blog.cta}
            <ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} className="btn-arrow" />
          </a>
        </div>
      </article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
    </BlogShell>
  );
}
