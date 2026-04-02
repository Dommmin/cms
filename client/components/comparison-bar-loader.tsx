'use client';

import dynamic from 'next/dynamic';

const ComparisonBar = dynamic(
    () =>
        import('@/components/comparison-bar').then((m) => ({
            default: m.ComparisonBar,
        })),
    { ssr: false },
);

export function ComparisonBarLoader() {
    return <ComparisonBar />;
}
