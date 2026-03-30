import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 300;

import { getPage } from '@/api/cms';
import { PageRenderer } from '@/components/page-builder/page-renderer';
import { RecentlyViewed } from '@/components/recently-viewed';
import { generateAlternates } from '@/lib/seo';
import type { PageData } from './page.types';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getPage('home');
    return {
      title: page.seo_title ?? page.title,
      description: page.seo_description ?? undefined,
      alternates: generateAlternates('/'),
    };
  } catch {
    return {};
  }
}

export default async function HomePage() {
  const page = await getPage('home').catch(() => null);
  return <HomeContent page={page} />;
}

function HomeContent({ page }: { page: PageData | null }) {
  if (!page || !page.is_published) {
    notFound();
  }

  return (
    <>
      <PageRenderer page={page} />
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <RecentlyViewed />
      </div>
    </>
  );
}
