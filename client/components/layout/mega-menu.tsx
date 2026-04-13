'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';
import type { Category } from '@/types/api';
import type { MegaMenuProps, OpenKey } from './mega-menu.types';

function localiseUrl(
    url: string | null | undefined,
    lp: (path: string) => string,
): string {
    if (!url || url === '#') return '#';
    if (
        url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('//')
    )
        return url;
    return lp(url);
}

function CategoryIcon({ cat, size }: { cat: Category; size: number }) {
    if (cat.image_url) {
        return (
            <Image
                src={cat.image_url}
                alt={cat.name}
                width={size}
                height={size}
                className="object-cover"
                style={{ width: size, height: size }}
            />
        );
    }
    return (
        <span
            className="text-muted-foreground font-medium"
            style={{ fontSize: size * 0.4 }}
        >
            {cat.name[0]}
        </span>
    );
}

export function MegaMenu({ items, categories }: MegaMenuProps) {
    const [openKey, setOpenKey] = useState<OpenKey>(null);
    const [activeCatId, setActiveCatId] = useState<number | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lp = useLocalePath();
    const { t } = useTranslation();

    const activeCategory =
        activeCatId != null
            ? (categories.find((c) => c.id === activeCatId) ?? categories[0])
            : (categories[0] ?? null);

    function open(key: OpenKey) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setOpenKey(key);
        if (
            key === 'categories' &&
            activeCatId == null &&
            categories.length > 0
        ) {
            setActiveCatId(categories[0].id);
        }
    }

    function scheduleClose() {
        timeoutRef.current = setTimeout(() => setOpenKey(null), 120);
    }

    function cancelClose() {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }

    return (
        <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1 md:flex"
        >
            {/* ── Categories mega dropdown ─────────────────────────────────── */}
            {categories.length > 0 && (
                <div
                    className="relative"
                    onMouseEnter={() => open('categories')}
                    onMouseLeave={scheduleClose}
                >
                    <button
                        aria-expanded={openKey === 'categories'}
                        aria-haspopup="true"
                        aria-controls="mega-menu-categories"
                        className="text-foreground/80 hover:bg-accent hover:text-foreground flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors"
                    >
                        {t('nav.categories', 'Categories')}
                        <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform ${openKey === 'categories' ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                        />
                    </button>

                    {openKey === 'categories' && (
                        <div
                            id="mega-menu-categories"
                            className="border-border bg-background fixed top-16 right-0 left-0 z-40 border-t shadow-xl"
                            onMouseEnter={cancelClose}
                            onMouseLeave={scheduleClose}
                        >
                            <div className="mx-auto flex max-w-7xl px-4 sm:px-6 lg:px-8">
                                {/* Left panel — parent categories */}
                                <div className="border-border w-52 shrink-0 border-r py-5 pr-2">
                                    <p className="text-muted-foreground mb-2 px-3 text-[11px] font-semibold tracking-wider uppercase">
                                        {t(
                                            'nav.shop_by_category',
                                            'Shop by category',
                                        )}
                                    </p>

                                    <ul role="list">
                                        {categories.map((cat) => (
                                            <li key={cat.id}>
                                                <Link
                                                    href={lp(
                                                        `/products?category=${cat.slug}`,
                                                    )}
                                                    onMouseEnter={() =>
                                                        setActiveCatId(cat.id)
                                                    }
                                                    onClick={() =>
                                                        setOpenKey(null)
                                                    }
                                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                                                        activeCategory?.id ===
                                                        cat.id
                                                            ? 'bg-accent text-foreground font-semibold'
                                                            : 'text-foreground/70 hover:bg-accent/50 hover:text-foreground'
                                                    }`}
                                                >
                                                    <span className="truncate">
                                                        {cat.name}
                                                    </span>
                                                    {(cat.children?.length ??
                                                        0) > 0 && (
                                                        <ChevronRight
                                                            className="text-muted-foreground h-3.5 w-3.5 shrink-0"
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="border-border mt-3 border-t pt-3">
                                        <Link
                                            href={lp('/products')}
                                            onClick={() => setOpenKey(null)}
                                            className="text-primary px-3 text-xs font-medium hover:underline"
                                        >
                                            {t(
                                                'nav.view_all_products',
                                                'View all products →',
                                            )}
                                        </Link>
                                    </div>
                                </div>

                                {/* Right panel — subcategories */}
                                <div className="flex-1 py-5 pl-6">
                                    {activeCategory && (
                                        <>
                                            <div className="mb-3 flex items-center justify-between">
                                                <Link
                                                    href={lp(
                                                        `/products?category=${activeCategory.slug}`,
                                                    )}
                                                    onClick={() =>
                                                        setOpenKey(null)
                                                    }
                                                    className="text-foreground text-sm font-semibold hover:underline"
                                                >
                                                    {activeCategory.name}
                                                </Link>
                                                <Link
                                                    href={lp(
                                                        `/products?category=${activeCategory.slug}`,
                                                    )}
                                                    onClick={() =>
                                                        setOpenKey(null)
                                                    }
                                                    className="text-primary text-xs hover:underline"
                                                >
                                                    {t(
                                                        'nav.view_all_in',
                                                        `View all in ${activeCategory.name} →`,
                                                    )}
                                                </Link>
                                            </div>

                                            {(activeCategory.children?.length ??
                                                0) > 0 ? (
                                                <ul
                                                    role="list"
                                                    className="grid grid-cols-3 gap-1 lg:grid-cols-4 xl:grid-cols-5"
                                                >
                                                    {activeCategory.children!.map(
                                                        (child) => (
                                                            <li key={child.id}>
                                                                <Link
                                                                    href={lp(
                                                                        `/products?category=${child.slug}`,
                                                                    )}
                                                                    onClick={() =>
                                                                        setOpenKey(
                                                                            null,
                                                                        )
                                                                    }
                                                                    className="group hover:bg-accent flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors"
                                                                >
                                                                    <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md">
                                                                        <CategoryIcon
                                                                            cat={
                                                                                child
                                                                            }
                                                                            size={
                                                                                32
                                                                            }
                                                                        />
                                                                    </div>
                                                                    <span className="text-foreground/80 group-hover:text-foreground line-clamp-2 text-xs leading-tight">
                                                                        {
                                                                            child.name
                                                                        }
                                                                    </span>
                                                                </Link>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            ) : (
                                                <p className="text-muted-foreground text-sm">
                                                    {t(
                                                        'nav.browse_category',
                                                        'Browse all products in this category',
                                                    )}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── CMS menu items ────────────────────────────────────────────── */}
            {items.map((item) => (
                <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() =>
                        item.children?.length ? open(item.id) : undefined
                    }
                    onMouseLeave={scheduleClose}
                >
                    <Link
                        href={localiseUrl(item.url, lp)}
                        target={item.target}
                        aria-expanded={
                            item.children?.length
                                ? openKey === item.id
                                : undefined
                        }
                        aria-haspopup={
                            item.children?.length ? 'true' : undefined
                        }
                        className="text-foreground/80 hover:bg-accent hover:text-foreground flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors"
                    >
                        {item.label}
                        {item.children?.length ? (
                            <ChevronDown
                                className={`h-3.5 w-3.5 transition-transform ${openKey === item.id ? 'rotate-180' : ''}`}
                                aria-hidden="true"
                            />
                        ) : null}
                    </Link>

                    {item.children?.length && openKey === item.id ? (
                        <div
                            className="border-border bg-background absolute top-full left-0 z-40 mt-1 min-w-48 rounded-xl border shadow-lg"
                            onMouseEnter={cancelClose}
                            onMouseLeave={scheduleClose}
                        >
                            <ul role="list" className="p-1">
                                {item.children.map((child) => (
                                    <li key={child.id}>
                                        <Link
                                            href={localiseUrl(child.url, lp)}
                                            target={child.target}
                                            onClick={() => setOpenKey(null)}
                                            className="text-foreground/80 hover:bg-accent hover:text-foreground block rounded-lg px-3 py-2 text-sm"
                                        >
                                            {child.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </div>
            ))}
        </nav>
    );
}
