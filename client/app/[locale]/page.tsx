import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getPage } from '@/api/cms';
import { PageRenderer } from '@/components/page-builder/page-renderer';
import { RecentlyViewed } from '@/components/recently-viewed';
import { DEFAULT_LOCALE, isValidLocale } from '@/lib/i18n';
import type { PageProps } from './page.types';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { locale } = await params;
    const slug = isValidLocale(locale) ? 'home' : locale;
    const fetchLocale = isValidLocale(locale) ? locale : DEFAULT_LOCALE;
    const page = await getPage(slug, fetchLocale);
    return {
      title: page.seo_title ?? page.title,
      description: page.seo_description ?? undefined,
    };
  } catch {
    return {};
  }
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    // This segment is actually an English page slug (e.g. /contact intercepted here)
    const page = await getPage(locale, DEFAULT_LOCALE).catch(() => null);
    if (!page || !page.is_published) notFound();
    return <PageRenderer page={page} />;
  }

  const page = await getPage('home', locale).catch(() => null);
  if (!page || !page.is_published) notFound();

  return (
    <>
      <PageRenderer page={page} />
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <RecentlyViewed />
      </div>
    </>
  );
}
