export interface SearchFacetCategory {
    id: string;
    slug: string;
    name: string;
    count: number;
}

export interface SearchFacetBrand {
    id: string;
    slug: string;
    name: string;
    count: number;
}

export interface SearchFacets {
    categories: SearchFacetCategory[];
    brands: SearchFacetBrand[];
    price_ranges: {
        min: number;
        max: number;
    };
}

export interface SearchMeta {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    facets: SearchFacets;
    did_you_mean: string | null;
}

export interface SearchResult {
    data: {
        id: number;
        name: string;
        slug: string;
        short_description: string | null;
        description: string | null;
        price_min: number;
        price_max: number;
        is_active: boolean;
        is_featured: boolean;
        is_on_sale: boolean;
        discount_percentage: number | null;
        compare_at_price_min: number | null;
        omnibus_price_min: number | null;
        thumbnail: {
            id: number;
            url: string;
            thumb_url: string;
            alt: string | null;
            position: number;
        } | null;
        category: {
            id: number;
            name: string;
            slug: string;
        } | null;
        brand: {
            id: number;
            name: string;
        } | null;
    }[];
    meta: SearchMeta;
}

export interface SearchSuggestion {
    type: 'product' | 'category' | 'blog_post';
    id: number;
    name: string;
    slug: string;
    thumbnail: string;
    price?: number;
    products_count?: number;
    excerpt?: string;
}

export interface AutocompleteResult {
    suggestions: SearchSuggestion[];
}

export interface SearchFilters {
    q?: string;
    category?: string;
    brand?: string;
    min_price?: number;
    max_price?: number;
    sort?: string;
    page?: number;
    per_page?: number;
}
