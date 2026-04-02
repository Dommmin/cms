'use client';

import { useState } from 'react';

export interface AdminPreviewEntity {
    type: 'page' | 'blog_post' | 'product' | 'category' | null;
    id: number | null;
    name: string | null;
    admin_url: string | null;
}

export interface AdminPreviewState {
    isPreview: boolean;
    entity: AdminPreviewEntity | null;
}

function parsePreviewCookie(): AdminPreviewState {
    if (typeof document === 'undefined') {
        return { isPreview: false, entity: null };
    }

    const match = document.cookie
        .split('; ')
        .find((row) => row.startsWith('admin_preview='));

    if (!match) {
        return { isPreview: false, entity: null };
    }

    try {
        const value = decodeURIComponent(match.split('=').slice(1).join('='));
        const parsed = JSON.parse(value) as { entity?: AdminPreviewEntity };
        return { isPreview: true, entity: parsed.entity ?? null };
    } catch {
        return { isPreview: false, entity: null };
    }
}

export function useAdminPreview(): AdminPreviewState {
    const [state] = useState<AdminPreviewState>(parsePreviewCookie);

    return state;
}
