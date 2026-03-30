import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getPage } from '@/api/cms';
import { JsonLd } from '@/components/json-ld';
import { PageRenderer } from '@/components/page-builder/page-renderer';
import { DEFAULT_LOCALE, isValidLocale } from '@/lib/i18n';
import { buildFaqPage, buildWebPage } from '@/lib/schema';
import { generateCanonical } from '@/lib/seo';
import type { PageData, PageProps } from './page.types';

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { locale, slug: rawSlug } = await params;
    const [resolvedLocale, slug] = isValidLocale(locale)
      ? [locale, rawSlug]
      : [DEFAULT_LOCALE, [locale, ...rawSlug]];
    const page = await getPage(slug.join('/'), resolvedLocale);
    return {
      title: page.seo_title ?? page.title,
      description: page.seo_description ?? undefined,
      robots: page.meta_robots ?? 'index, follow',
      alternates: page.seo_canonical ? { canonical: page.seo_canonical } : undefined,
      openGraph: {
        title: page.seo_title ?? page.title,
        description: page.seo_description ?? undefined,
        images: page.og_image ? [page.og_image] : [],
      },
      twitter: { card: 'summary_large_image' },
    };
  } catch {
    return {};
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { locale, slug: rawSlug } = await params;
  const [resolvedLocale, slug] = isValidLocale(locale)
    ? [locale, rawSlug]
    : [DEFAULT_LOCALE, [locale, ...rawSlug]];
  const page = await getPage(slug.join('/'), resolvedLocale).catch(() => null);
  return <PageContent page={page} slug={slug} locale={resolvedLocale} />;
}

function PageContent({
  page,
  slug,
  locale,
}: {
  page: PageData | null;
  slug: string[];
  locale: string;
}) {
  if (!page || !page.is_published) {
    notFound();
  }

  const path = `/${locale}/${slug.join('/')}`;

  const schemaData =
    page.module_name === 'faq' &&
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
