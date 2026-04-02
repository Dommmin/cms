import type { Metadata } from 'next';
import { Suspense } from 'react';

import { generateAlternates } from '@/lib/seo';
import { SearchClient } from './_search-client';

export const metadata: Metadata = {
    title: 'Search',
    description: 'Search our product catalogue.',
    alternates: generateAlternates('/search'),
    robots: 'noindex',
};

export default function SearchPage() {
    return (
        <Suspense>
            <SearchClient />
        </Suspense>
    );
}
