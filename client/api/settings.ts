import type { PublicSettingsResponse } from '@/app/layout.types';
import { serverFetch } from '@/lib/server-fetch';
import { cache } from 'react';

export const getPublicSettings = cache(async () =>
    serverFetch<PublicSettingsResponse>('/settings/public', {
        revalidate: 300,
        tags: ['settings'],
    }).catch(() => null),
);
