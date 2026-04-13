'use client';

import { ArrowRight, Clock, Search, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useCategories } from '@/hooks/use-cms';
import { useLocalePath } from '@/hooks/use-locale';
import {
    addRecentSearch,
    clearRecentSearches,
    getRecentSearches,
    useSearchSuggestions,
} from '@/hooks/use-search';
import { formatPrice } from '@/lib/format';
import type { Category, Product } from '@/types/api';

function HighlightedText({ text, query }: { text: string; query: string }) {
    if (!query) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
        <span>
            {text.slice(0, idx)}
            <mark className="text-foreground bg-transparent font-semibold">
                {text.slice(idx, idx + query.length)}
            </mark>
            {text.slice(idx + query.length)}
        </span>
    );
}

export function SearchBar() {
    const router = useRouter();
    const lp = useLocalePath();

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: categoriesData } = useCategories();
    const categories = categoriesData ?? [];

    const { data: searchData, isLoading } = useSearchSuggestions(query);
    const products: Product[] = searchData?.data ?? [];

    const matchedCategories: Category[] =
        query.trim().length >= 1
            ? categories
                  .filter((c) =>
                      c.name.toLowerCase().includes(query.toLowerCase()),
                  )
                  .slice(0, 3)
            : [];

    const allItems = [
        ...matchedCategories.map((c) => ({
            url: lp(`/products?category=${c.slug}`),
        })),
        ...products.map((p) => ({ url: lp(`/products/${p.slug}`) })),
    ];

    const showRecent = query.trim().length === 0 && recentSearches.length > 0;
    const showResults = query.trim().length >= 2;

    function openSearch() {
        setRecentSearches(getRecentSearches());
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    }

    function closeSearch() {
        setOpen(false);
        setQuery('');
        setActiveIndex(-1);
    }

    function navigate(url: string, searchQuery?: string) {
        if (searchQuery) addRecentSearch(searchQuery);
        closeSearch();
        router.push(url);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        navigate(lp(`/search?q=${encodeURIComponent(q)}`), q);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Escape') {
            closeSearch();
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, allItems.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, -1));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            navigate(allItems[activeIndex].url);
        }
    }

    useEffect(() => {
        if (!open) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') closeSearch();
        }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    return (
        <>
            <button
                onClick={openSearch}
                className="hover:bg-accent inline-flex h-9 w-9 items-center justify-center rounded-md"
                aria-label="Search"
            >
                <Search className="h-4 w-4" />
            </button>

            {open && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-black/30"
                        onClick={closeSearch}
                    />

                    {/* Panel */}
                    <div
                        role="dialog"
                        aria-label="Search"
                        aria-modal="true"
                        className="border-border bg-background fixed top-16 right-0 left-0 z-50 border-b shadow-xl"
                    >
                        <div className="mx-auto max-w-2xl px-4 py-4">
                            {/* Input row */}
                            <form
                                onSubmit={handleSubmit}
                                role="search"
                                className="flex items-center gap-2"
                            >
                                <Search
                                    className="text-muted-foreground h-5 w-5 shrink-0"
                                    aria-hidden="true"
                                />
                                <label
                                    htmlFor="header-search-input"
                                    className="sr-only"
                                >
                                    Search products and categories
                                </label>
                                <input
                                    id="header-search-input"
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setActiveIndex(-1);
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Search products, categories…"
                                    aria-autocomplete="list"
                                    aria-controls="search-listbox"
                                    autoComplete="off"
                                    className="placeholder:text-muted-foreground flex-1 bg-transparent text-base outline-none"
                                />
                                {query && (
                                    <button
                                        type="button"
                                        onClick={() => setQuery('')}
                                        aria-label="Clear search"
                                        className="hover:bg-accent rounded p-1"
                                    >
                                        <X
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={closeSearch}
                                    className="text-muted-foreground hover:text-foreground ml-1 text-sm"
                                >
                                    Cancel
                                </button>
                            </form>

                            {/* Live region for screen reader result announcements */}
                            <div
                                aria-live="polite"
                                aria-atomic="true"
                                className="sr-only"
                            >
                                {showResults && !isLoading && (
                                    <>
                                        {products.length === 0 &&
                                        matchedCategories.length === 0
                                            ? `No results for ${query}`
                                            : `${products.length + matchedCategories.length} results found`}
                                    </>
                                )}
                            </div>

                            {/* Recent searches */}
                            {showRecent && (
                                <div className="mt-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                                            Recent
                                        </span>
                                        <button
                                            onClick={() => {
                                                clearRecentSearches();
                                                setRecentSearches([]);
                                            }}
                                            aria-label="Clear recent searches"
                                            className="text-muted-foreground hover:text-foreground text-xs"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <div className="space-y-0.5">
                                        {recentSearches.map((q) => (
                                            <button
                                                key={q}
                                                onClick={() =>
                                                    navigate(
                                                        lp(
                                                            `/search?q=${encodeURIComponent(q)}`,
                                                        ),
                                                        q,
                                                    )
                                                }
                                                className="hover:bg-accent flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm"
                                            >
                                                <Clock className="text-muted-foreground h-3.5 w-3.5" />
                                                <span>{q}</span>
                                                <ArrowRight className="text-muted-foreground ml-auto h-3.5 w-3.5" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Results */}
                            {showResults && (
                                <div
                                    id="search-listbox"
                                    className="mt-4 space-y-4"
                                >
                                    {/* Categories */}
                                    {matchedCategories.length > 0 && (
                                        <div>
                                            <span className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wide uppercase">
                                                Categories
                                            </span>
                                            <div className="space-y-0.5">
                                                {matchedCategories.map(
                                                    (cat, i) => (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() =>
                                                                navigate(
                                                                    lp(
                                                                        `/products?category=${cat.slug}`,
                                                                    ),
                                                                )
                                                            }
                                                            className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                                                                activeIndex ===
                                                                i
                                                                    ? 'bg-accent'
                                                                    : 'hover:bg-accent'
                                                            }`}
                                                        >
                                                            {cat.image_url ? (
                                                                <Image
                                                                    src={
                                                                        cat.image_url
                                                                    }
                                                                    alt={
                                                                        cat.name
                                                                    }
                                                                    width={20}
                                                                    height={20}
                                                                    className="h-5 w-5 rounded object-cover"
                                                                />
                                                            ) : (
                                                                <span className="bg-muted flex h-5 w-5 items-center justify-center rounded text-xs">
                                                                    {
                                                                        cat
                                                                            .name[0]
                                                                    }
                                                                </span>
                                                            )}
                                                            <HighlightedText
                                                                text={cat.name}
                                                                query={query}
                                                            />
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Products — skeleton */}
                                    {isLoading && (
                                        <div className="space-y-2">
                                            {[1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className="flex animate-pulse items-center gap-3"
                                                >
                                                    <div className="bg-muted h-10 w-10 rounded-lg" />
                                                    <div className="bg-muted h-4 flex-1 rounded" />
                                                    <div className="bg-muted h-4 w-16 rounded" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Products */}
                                    {!isLoading && products.length > 0 && (
                                        <div>
                                            <span className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wide uppercase">
                                                Products
                                            </span>
                                            <div className="space-y-0.5">
                                                {products.map((product, i) => {
                                                    const idx =
                                                        matchedCategories.length +
                                                        i;
                                                    return (
                                                        <button
                                                            key={product.id}
                                                            onClick={() =>
                                                                navigate(
                                                                    lp(
                                                                        `/products/${product.slug}`,
                                                                    ),
                                                                )
                                                            }
                                                            className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-sm ${
                                                                activeIndex ===
                                                                idx
                                                                    ? 'bg-accent'
                                                                    : 'hover:bg-accent'
                                                            }`}
                                                        >
                                                            {product.thumbnail ? (
                                                                <Image
                                                                    src={
                                                                        product
                                                                            .thumbnail
                                                                            .url
                                                                    }
                                                                    alt={
                                                                        product
                                                                            .thumbnail
                                                                            .alt ??
                                                                        product.name
                                                                    }
                                                                    width={40}
                                                                    height={40}
                                                                    className="h-10 w-10 rounded-lg object-cover"
                                                                />
                                                            ) : (
                                                                <div className="bg-muted h-10 w-10 shrink-0 rounded-lg" />
                                                            )}
                                                            <div className="flex-1 text-left">
                                                                <HighlightedText
                                                                    text={
                                                                        product.name
                                                                    }
                                                                    query={
                                                                        query
                                                                    }
                                                                />
                                                                {product.category && (
                                                                    <p className="text-muted-foreground text-xs">
                                                                        {
                                                                            product
                                                                                .category
                                                                                .name
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <span className="shrink-0 text-sm font-medium">
                                                                {formatPrice(
                                                                    product.price_min,
                                                                )}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* No results */}
                                    {!isLoading &&
                                        products.length === 0 &&
                                        matchedCategories.length === 0 && (
                                            <p className="text-muted-foreground py-4 text-center text-sm">
                                                No results for &ldquo;{query}
                                                &rdquo;
                                            </p>
                                        )}

                                    {/* View all */}
                                    {(products.length > 0 ||
                                        matchedCategories.length > 0) && (
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    lp(
                                                        `/search?q=${encodeURIComponent(query.trim())}`,
                                                    ),
                                                    query.trim(),
                                                )
                                            }
                                            className="border-border hover:bg-accent flex w-full items-center justify-center gap-1 rounded-lg border py-2 text-sm font-medium"
                                        >
                                            View all results for &ldquo;{query}
                                            &rdquo;
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
