import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ogImage, site } from "@/content/site";
import { blog, blogPath, formatDate, posts } from "@/content/blog";
import BlogShell from "@/components/BlogShell";

// The blog is Serbian only: /en/blog is not generated
export function generateStaticParams() {
  return [{ lang: "sr" }];
}

export const dynamicParams = false;

export const metadata: Metadata = {
  title: blog.title,
  description: blog.description,
  alternates: { canonical: `${site.url}${blogPath()}` },
  openGraph: {
    type: "website",
    url: `${site.url}${blogPath()}`,
    siteName: site.name,
    title: blog.title,
    description: blog.description,
    locale: "sr_RS",
    images: [{ url: ogImage.src, width: ogImage.width, height: ogImage.height, type: "image/jpeg" }],
  },
};

export default async function BlogIndex({ params }: PageProps<"/[lang]/blog">) {
  const { lang } = await params;
  if (lang !== "sr") notFound();

  return (
    <BlogShell>
      <div className="container-x py-[var(--section-y)]">
        <p className="kicker text-teal-deep">{site.name}</p>
        <h1 className="display display-lg mt-5 text-ink">{blog.heading}</h1>
        <p className="mt-6 max-w-[var(--measure)] text-[1.0625rem] leading-[1.6] text-muted">{blog.lead}</p>

        <ul className="mt-[var(--block-gap)] border-y border-[var(--line-light)]">
          {posts.map((post) => (
            <li key={post.slug} className="py-8">
              <article>
                <time dateTime={post.published} className="text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-teal-deep">
                  {formatDate(post.published)}
                </time>
                <h2 className="mt-3 font-display text-[clamp(1.6rem,5vw,2.3rem)] font-semibold uppercase leading-[1.05] text-ink">
                  <a href={blogPath(post.slug)} className="transition-colors hover:text-teal-deep">
                    {post.title}
                  </a>
                </h2>
                <p className="mt-3 max-w-[40rem] leading-[1.6] text-muted">{post.description}</p>
                <a
                  href={blogPath(post.slug)}
                  className="group mt-4 inline-flex min-h-11 items-center gap-3 text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-teal-deep"
                >
                  {blog.readMore}
                  <span className="sr-only">: {post.title}</span>
                  <ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} className="btn-arrow" />
                </a>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </BlogShell>
  );
}
