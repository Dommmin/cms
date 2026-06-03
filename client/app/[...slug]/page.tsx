import type { Metadata } from 'next';

import {
    CmsDynamicPage,
    generateDynamicPageMetadata,
} from '@/app/_routes/cms-dynamic-page';
import type { PageProps } from './page.types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params;

    return generateDynamicPageMetadata({ slug });
}

export default async function DynamicPage({ params, searchParams }: PageProps) {
    const { slug } = await params;

    return <CmsDynamicPage slug={slug} searchParams={await searchParams} />;
}
