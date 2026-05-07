'use client';

import { HydrationBoundary, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

import { makeQueryClient } from '@/lib/query-client';

export function QueryProvider({
    children,
    dehydratedState,
}: {
    children: React.ReactNode;
    dehydratedState?: unknown;
}) {
    const [client] = useState(makeQueryClient);

    return (
        <QueryClientProvider client={client}>
            <HydrationBoundary state={dehydratedState}>
                {children}
            </HydrationBoundary>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
