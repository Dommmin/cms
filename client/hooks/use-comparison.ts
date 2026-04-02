'use client';

import { useQuery } from '@tanstack/react-query';
import { startTransition, useCallback, useEffect, useState } from 'react';

import { api } from '@/lib/axios';
import type { Product } from '@/types/api';

const STORAGE_KEY = 'compare_ids';
const MAX_COMPARE = 4;

function getIds(): number[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed)
            ? parsed.filter((id) => typeof id === 'number')
            : [];
    } catch {
        return [];
    }
}

function saveIds(ids: number[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event('comparison-change'));
}

export function useComparisonIds() {
    // Always start with [] to match SSR output — hydrate from localStorage after mount
    const [ids, setIds] = useState<number[]>([]);

    useEffect(() => {
        // Sync on mount and on every comparison-change event
        startTransition(() => setIds(getIds()));
        const handler = () => setIds(getIds());
        window.addEventListener('comparison-change', handler);
        return () => window.removeEventListener('comparison-change', handler);
    }, []);

    return ids;
}

export function addToCompare(id: number): void {
    const ids = getIds();
    if (ids.includes(id) || ids.length >= MAX_COMPARE) return;
    saveIds([...ids, id]);
}

export function removeFromCompare(id: number): void {
    saveIds(getIds().filter((i) => i !== id));
}

export function clearComparison(): void {
    saveIds([]);
}

export function isInComparison(id: number): boolean {
    return getIds().includes(id);
}

export function useIsInComparison(id: number) {
    const ids = useComparisonIds();
    return ids.includes(id);
}

interface CompareResponse {
    products: Product[];
    attributeKeys: string[];
}

export function useComparisonProducts() {
    const ids = useComparisonIds();

    return useQuery({
        queryKey: ['comparison', ids.join(',')],
        queryFn: async (): Promise<CompareResponse> => {
            if (ids.length === 0) return { products: [], attributeKeys: [] };
            const params = ids.reduce<Record<string, number>>((acc, id, i) => {
                acc[`ids[${i}]`] = id;
                return acc;
            }, {});
            try {
                const { data } = await api.get<{
                    data: Product[];
                    meta: { attribute_keys: string[] };
                }>('/products/compare', { params });
                return {
                    products: Array.isArray(data.data) ? data.data : [],
                    attributeKeys: data.meta?.attribute_keys ?? [],
                };
            } catch {
                clearComparison();
                return { products: [], attributeKeys: [] };
            }
        },
        enabled: ids.length >= 2,
        staleTime: 60 * 1000,
        retry: false,
    });
}

export function useToggleComparison(id: number) {
    const inComparison = useIsInComparison(id);

    return useCallback(() => {
        if (inComparison) {
            removeFromCompare(id);
        } else {
            addToCompare(id);
        }
    }, [id, inComparison]);
}
