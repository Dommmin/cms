import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { getPage } from "@/api/cms";
import { JsonLd } from "@/components/json-ld";
import { PageRenderer } from "@/components/page-builder/page-renderer";
import { buildFaqPage, buildWebPage } from "@/lib/schema";
import { generateCanonical } from "@/lib/seo";
import type { PageProps, PageData } from './page.types';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const [{ slug }, headersList] = await Promise.all([params, headers()]);
    const locale = headersList.get("x-locale") ?? "en";
    const page = await getPage(slug.join("/"), locale);
    return {
      title: page.seo_title ?? page.title,
      description: page.seo_description ?? undefined,
      robots: page.meta_robots ?? "index, follow",
      alternates: page.seo_canonical
        ? { canonical: page.seo_canonical }
        : undefined,
      openGraph: {
        title: page.seo_title ?? page.title,
        description: page.seo_description ?? undefined,
        images: page.og_image ? [page.og_image] : [],
      },
      twitter: { card: "summary_large_image" },
    };
  } catch {
    return {};
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const [{ slug }, headersList] = await Promise.all([params, headers()]);
  const locale = headersList.get("x-locale") ?? "en";
  const page = await getPage(slug.join("/"), locale).catch(() => null);

  // Always return JSX so Turbopack can finish timing DynamicPage normally.
  // notFound() is called inside the sync PageContent child to avoid the
  // "cannot have a negative time stamp" Turbopack bug.
  return <PageContent page={page} slug={slug} />;
}

function PageContent({
  page,
  slug,
}: {
  page: PageData | null;
  slug: string[];
}) {
  if (!page || !page.is_published) {
    notFound();
  }

  const path = `/${slug.join("/")}`;

  const schemaData =
    page.module_name === "faq" &&
    Array.isArray((page.module_config as { items?: unknown[] } | null)?.items)
      ? buildFaqPage(
          (page.module_config as { items: { question: string; answer: string }[] }).items,
        )
      : buildWebPage({
          title: page.seo_title ?? page.title,
          description: page.seo_description,
          url: generateCanonical(path),
        });

  return (
    <>
      <JsonLd data={schemaData} />
      <PageRenderer page={page} />
    </>
  );
}
