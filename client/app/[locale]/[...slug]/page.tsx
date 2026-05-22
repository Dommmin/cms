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
    const { locale, slug } = await params;

    return generateDynamicPageMetadata({ locale, slug });
}

export default async function DynamicPage({ params }: PageProps) {
    const { locale, slug } = await params;

    return <CmsDynamicPage locale={locale} slug={slug} />;
}
