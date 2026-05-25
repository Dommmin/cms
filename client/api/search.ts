import type {
    AutocompleteResult,
    SearchFilters,
    SearchResult,
} from '@/api/search.types';
import { apiGet } from '@/lib/api';

export async function searchProducts(
    filters: SearchFilters = {},
): Promise<SearchResult> {
    const params: Record<string, unknown> = {};

    if (filters.q) params.q = filters.q;
    if (filters.category) params.category = filters.category;
    if (filters.brand) params.brand = filters.brand;
    if (filters.min_price != null) params.min_price = filters.min_price;
    if (filters.max_price != null) params.max_price = filters.max_price;
    if (filters.sort) params.sort = filters.sort;
    if (filters.page) params.page = filters.page;
    if (filters.per_page) params.per_page = filters.per_page;

    return apiGet<SearchResult>('/search', { params }) as Promise<SearchResult>;
}

export async function searchAutocomplete(
    q: string,
    limit = 10,
): Promise<AutocompleteResult> {
    return apiGet<AutocompleteResult>('/search/autocomplete', {
        params: { q, limit },
    }) as Promise<AutocompleteResult>;
}
