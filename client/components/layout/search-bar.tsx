'use client';

import {
    ArrowRight,
    Clock,
    FileText,
    FolderOpen,
    Search,
    X,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import type { SearchSuggestion } from '@/api/search.types';
import { useLocalePath } from '@/hooks/use-locale';
import {
    addRecentSearch,
    clearRecentSearches,
    getRecentSearches,
    useSearchSuggestions,
} from '@/hooks/use-search';
import { formatPrice } from '@/lib/format';

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

function suggestionUrl(
    s: SearchSuggestion,
    lp: (path: string) => string,
): string {
    switch (s.type) {
        case 'category':
            return lp(`/products?category=${s.slug}`);
        case 'blog_post':
            return lp(`/blog/${s.slug}`);
        default:
            return lp(`/products/${s.slug}`);
    }
}

export function SearchBar() {
    const router = useRouter();
    const lp = useLocalePath();

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: searchData, isLoading } = useSearchSuggestions(query);
    const suggestions: SearchSuggestion[] = searchData ?? [];

    const categories = suggestions.filter((s) => s.type === 'category');
    const blogPosts = suggestions.filter((s) => s.type === 'blog_post');
    const products = suggestions.filter((s) => s.type === 'product');

    const allItems = suggestions.map((s) => ({
        url: suggestionUrl(s, lp),
    }));

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

    useEffect(() => {
        function onOpenSearch() {
            openSearch();
        }
        window.addEventListener('open-search', onOpenSearch);
        return () => window.removeEventListener('open-search', onOpenSearch);
    }, []);

    const globalIndex = (type: SearchSuggestion['type'], i: number): number => {
        let offset = 0;
        if (type === 'category') return i;
        offset += categories.length;
        if (type === 'blog_post') return offset + i;
        offset += blogPosts.length;
        return offset + i;
    };

    return (
        <>
            <button
                onClick={openSearch}
                className="hover:bg-accent hidden h-9 w-9 items-center justify-center rounded-md md:inline-flex"
                aria-label="Search"
            >
                <Search className="h-4 w-4" />
            </button>

            {open && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                        onClick={closeSearch}
                    />

                    {/* Panel */}
                    <div
                        role="dialog"
                        aria-label="Search"
                        aria-modal="true"
                        className="fixed top-16 right-0 left-0 z-50 overflow-hidden rounded-b-2xl border border-white/20 bg-white/80 shadow-[0_20px_60px_-10px_oklch(0_0_0_/_0.2)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-neutral-900/80 dark:shadow-[0_20px_60px_-10px_oklch(0_0_0_/_0.5)]"
                    >
                        <div className="mx-auto max-h-[70vh] max-w-2xl overflow-y-auto px-4 py-4">
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
                                    Search products
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
                                    placeholder="Search products…"
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

                            {/* Live region */}
                            <div
                                aria-live="polite"
                                aria-atomic="true"
                                className="sr-only"
                            >
                                {showResults && !isLoading && (
                                    <>
                                        {suggestions.length === 0
                                            ? `No results for ${query}`
                                            : `${suggestions.length} results found`}
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
                                    {/* Skeleton */}
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

                                    {/* Categories */}
                                    {!isLoading && categories.length > 0 && (
                                        <div>
                                            <span className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wide uppercase">
                                                Categories
                                            </span>
                                            <div className="space-y-0.5">
                                                {categories.map((cat, i) => {
                                                    const idx = globalIndex(
                                                        'category',
                                                        i,
                                                    );
                                                    return (
                                                        <button
                                                            key={`cat-${cat.id}`}
                                                            onClick={() =>
                                                                navigate(
                                                                    suggestionUrl(
                                                                        cat,
                                                                        lp,
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
                                                            {cat.thumbnail ? (
                                                                <Image
                                                                    src={
                                                                        cat.thumbnail
                                                                    }
                                                                    alt={
                                                                        cat.name
                                                                    }
                                                                    width={32}
                                                                    height={32}
                                                                    className="h-8 w-8 rounded object-cover"
                                                                />
                                                            ) : (
                                                                <span className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded text-xs">
                                                                    <FolderOpen className="h-4 w-4" />
                                                                </span>
                                                            )}
                                                            <div className="flex-1 text-left">
                                                                <HighlightedText
                                                                    text={
                                                                        cat.name
                                                                    }
                                                                    query={
                                                                        query
                                                                    }
                                                                />
                                                                {cat.products_count !=
                                                                    null && (
                                                                    <span className="text-muted-foreground ml-1 text-xs">
                                                                        (
                                                                        {
                                                                            cat.products_count
                                                                        }
                                                                        )
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Blog posts */}
                                    {!isLoading && blogPosts.length > 0 && (
                                        <div>
                                            <span className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wide uppercase">
                                                Blog
                                            </span>
                                            <div className="space-y-0.5">
                                                {blogPosts.map((post, i) => {
                                                    const idx = globalIndex(
                                                        'blog_post',
                                                        i,
                                                    );
                                                    return (
                                                        <button
                                                            key={`post-${post.id}`}
                                                            onClick={() =>
                                                                navigate(
                                                                    suggestionUrl(
                                                                        post,
                                                                        lp,
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
                                                            {post.thumbnail ? (
                                                                <Image
                                                                    src={
                                                                        post.thumbnail
                                                                    }
                                                                    alt={
                                                                        post.name
                                                                    }
                                                                    width={32}
                                                                    height={32}
                                                                    className="h-8 w-8 rounded object-cover"
                                                                />
                                                            ) : (
                                                                <span className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded text-xs">
                                                                    <FileText className="h-4 w-4" />
                                                                </span>
                                                            )}
                                                            <div className="flex-1 text-left">
                                                                <HighlightedText
                                                                    text={
                                                                        post.name
                                                                    }
                                                                    query={
                                                                        query
                                                                    }
                                                                />
                                                                {post.excerpt && (
                                                                    <p className="text-muted-foreground line-clamp-1 text-xs">
                                                                        {
                                                                            post.excerpt
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
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
                                                    const idx = globalIndex(
                                                        'product',
                                                        i,
                                                    );
                                                    return (
                                                        <button
                                                            key={`prod-${product.id}`}
                                                            onClick={() =>
                                                                navigate(
                                                                    suggestionUrl(
                                                                        product,
                                                                        lp,
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
                                                                        product.thumbnail
                                                                    }
                                                                    alt={
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
                                                            </div>
                                                            {product.price !=
                                                                null && (
                                                                <span className="shrink-0 text-sm font-medium">
                                                                    {formatPrice(
                                                                        product.price,
                                                                    )}
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* No results */}
                                    {!isLoading && suggestions.length === 0 && (
                                        <p className="text-muted-foreground py-4 text-center text-sm">
                                            No results for &ldquo;{query}
                                            &rdquo;
                                        </p>
                                    )}

                                    {/* View all */}
                                    {suggestions.length > 0 && (
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
