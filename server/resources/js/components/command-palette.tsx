import axios from 'axios';
import { router } from '@inertiajs/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
    BarChart3,
    FileText,
    Folders,
    LayoutDashboard,
    Loader2,
    Package,
    Search,
    Settings,
    ShoppingCart,
    Users,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import AdminSearchController from '@/actions/App/Http/Controllers/Admin/AdminSearchController';
import * as ProductController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductController';
import * as OrderController from '@/actions/App/Http/Controllers/Admin/Ecommerce/OrderController';
import * as BlogPostController from '@/actions/App/Http/Controllers/Admin/BlogPostController';
import * as PageController from '@/actions/App/Http/Controllers/Admin/Cms/PageController';
import * as UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import * as NewsletterCampaignController from '@/actions/App/Http/Controllers/Admin/NewsletterCampaignController';
import * as SettingsController from '@/actions/App/Http/Controllers/Admin/SettingsController';
import { dashboard } from '@/routes/admin';

import { cn } from '@/lib/utils';
import type { SearchResult, NavShortcut } from './command-palette.types';

// ── Types ──────────────────────────────────────────────────────────────────

// ── Static nav shortcuts ───────────────────────────────────────────────────

const NAV_SHORTCUTS: NavShortcut[] = [
    {
        group: 'Navigate',
        label: 'Dashboard',
        url: dashboard().url,
        icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
        group: 'Navigate',
        label: 'Products',
        url: ProductController.index.url(),
        icon: <Package className="h-4 w-4" />,
    },
    {
        group: 'Navigate',
        label: 'Orders',
        url: OrderController.index.url(),
        icon: <ShoppingCart className="h-4 w-4" />,
    },
    {
        group: 'Navigate',
        label: 'Blog Posts',
        url: BlogPostController.index.url(),
        icon: <FileText className="h-4 w-4" />,
    },
    {
        group: 'Navigate',
        label: 'Pages',
        url: PageController.index.url(),
        icon: <Folders className="h-4 w-4" />,
    },
    {
        group: 'Navigate',
        label: 'Users',
        url: UserController.index.url(),
        icon: <Users className="h-4 w-4" />,
    },
    {
        group: 'Navigate',
        label: 'Newsletter',
        url: NewsletterCampaignController.index.url(),
        icon: <BarChart3 className="h-4 w-4" />,
    },
    {
        group: 'Navigate',
        label: 'Settings',
        url: SettingsController.index.url(),
        icon: <Settings className="h-4 w-4" />,
    },
];

// ── Helpers ────────────────────────────────────────────────────────────────

const GROUP_ORDER = [
    'Navigate',
    'Products',
    'Blog Posts',
    'Pages',
    'Orders',
    'Users',
];

function groupResults(items: SearchResult[]): Record<string, SearchResult[]> {
    const grouped: Record<string, SearchResult[]> = {};
    for (const item of items) {
        if (!grouped[item.group]) grouped[item.group] = [];
        grouped[item.group].push(item);
    }
    return grouped;
}

function sortedGroups(grouped: Record<string, SearchResult[]>): string[] {
    return Object.keys(grouped).sort((a, b) => {
        const ai = GROUP_ORDER.indexOf(a);
        const bi = GROUP_ORDER.indexOf(b);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
}

// ── Main Component ─────────────────────────────────────────────────────────

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // ── Open shortcut ──────────────────────────────────────────────────────

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((o) => !o);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // ── Reset on close ─────────────────────────────────────────────────────

    const handleOpenChange = (value: boolean) => {
        setOpen(value);
        if (!value) {
            setQuery('');
            setResults([]);
            setActiveIndex(0);
        }
    };

    // ── Focus input on open ────────────────────────────────────────────────

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    // ── Search ─────────────────────────────────────────────────────────────

    const search = useCallback(async (q: string) => {
        if (q.trim().length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data } = await axios.get<SearchResult[]>(
                AdminSearchController.url({ query: { q } }),
                {
                    headers: { Accept: 'application/json' },
                },
            );
            setResults(data);
            setActiveIndex(0);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setQuery(q);
        setActiveIndex(0);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(q), 300);
    };

    // ── Flat list of all visible items ─────────────────────────────────────

    const displayItems: SearchResult[] =
        query.trim().length < 2 ? NAV_SHORTCUTS : results;

    // ── Keyboard navigation ────────────────────────────────────────────────

    const navigate = (item: SearchResult) => {
        router.visit(item.url);
        handleOpenChange(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, displayItems.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (displayItems[activeIndex]) navigate(displayItems[activeIndex]);
        }
    };

    // ── Scroll active item into view ───────────────────────────────────────

    useEffect(() => {
        const el = listRef.current?.querySelector(
            `[data-active="true"]`,
        ) as HTMLElement | null;
        el?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    // ── Render ─────────────────────────────────────────────────────────────

    const grouped = groupResults(displayItems);
    const groups = sortedGroups(grouped);

    return (
        <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
            {/* Trigger button shown in the header */}
            <DialogPrimitive.Trigger asChild>
                <button
                    className="flex h-9 items-center gap-2 rounded-md border border-input bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    aria-label="Search"
                >
                    <Search className="h-4 w-4 shrink-0" />
                    <span className="hidden lg:inline">Search…</span>
                    <kbd className="ml-1 hidden rounded border border-border bg-background px-1.5 text-xs lg:inline">
                        ⌘K
                    </kbd>
                </button>
            </DialogPrimitive.Trigger>

            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />

                <DialogPrimitive.Content
                    className="fixed top-[12%] left-1/2 z-50 w-full max-w-xl -translate-x-1/2 rounded-xl border border-border bg-background shadow-2xl focus:outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
                    onKeyDown={handleKeyDown}
                >
                    <DialogPrimitive.Title className="sr-only">
                        Command palette
                    </DialogPrimitive.Title>

                    {/* Search input */}
                    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                        {loading ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                        ) : (
                            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={handleInput}
                            placeholder="Search products, orders, pages…"
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            autoComplete="off"
                            spellCheck={false}
                        />
                        {query && (
                            <button
                                onClick={() => {
                                    setQuery('');
                                    setResults([]);
                                    inputRef.current?.focus();
                                }}
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Results */}
                    <div
                        ref={listRef}
                        className="max-h-[400px] overflow-y-auto py-2"
                    >
                        {displayItems.length === 0 &&
                            query.trim().length >= 2 &&
                            !loading && (
                                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                                    No results for &ldquo;{query}&rdquo;
                                </p>
                            )}

                        {groups.map((group) => (
                            <div key={group}>
                                <p className="px-4 pt-3 pb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    {group}
                                </p>
                                {grouped[group].map((item) => {
                                    const flatIndex =
                                        displayItems.indexOf(item);
                                    const isActive = flatIndex === activeIndex;
                                    return (
                                        <button
                                            key={`${item.group}-${item.url}`}
                                            data-active={isActive}
                                            onClick={() => navigate(item)}
                                            onMouseEnter={() =>
                                                setActiveIndex(flatIndex)
                                            }
                                            className={cn(
                                                'flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors',
                                                isActive
                                                    ? 'bg-accent text-accent-foreground'
                                                    : 'text-foreground hover:bg-accent/50',
                                            )}
                                        >
                                            {'icon' in item && (
                                                <span className="shrink-0 text-muted-foreground">
                                                    {(item as NavShortcut).icon}
                                                </span>
                                            )}
                                            <span className="flex-1 truncate font-medium">
                                                {item.label}
                                            </span>
                                            {item.meta && (
                                                <span className="shrink-0 truncate text-xs text-muted-foreground">
                                                    {item.meta}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Footer hint */}
                    <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-xs text-muted-foreground">
                        <span>
                            <kbd className="rounded border border-border px-1">
                                ↑↓
                            </kbd>{' '}
                            navigate
                        </span>
                        <span>
                            <kbd className="rounded border border-border px-1">
                                ↵
                            </kbd>{' '}
                            open
                        </span>
                        <span>
                            <kbd className="rounded border border-border px-1">
                                Esc
                            </kbd>{' '}
                            close
                        </span>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
