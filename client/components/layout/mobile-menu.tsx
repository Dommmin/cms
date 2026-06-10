'use client';

import {
    ChevronDown,
    Heart,
    LogOut,
    Menu,
    Package,
    Search,
    ShoppingBag,
    User,
    X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useLogout, useMe } from '@/hooks/use-auth';
import { useStorefrontRoutes } from '@/hooks/use-cms';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';
import { resolveCategoryPath } from '@/lib/public-paths';
import type { MobileMenuProps } from './mobile-menu.types';

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

export function MobileMenu({ items, categories, siteName }: MobileMenuProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [expandedCatId, setExpandedCatId] = useState<number | null>(null);
    const [mounted] = useState(() => typeof window !== 'undefined');
    const searchRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { data: user } = useMe();
    const { mutate: logout } = useLogout();
    const { t } = useTranslation();
    const lp = useLocalePath();
    const { data: storefrontRoutes } = useStorefrontRoutes();

    function closeMenu() {
        setMenuOpen(false);
        setQuery('');
        setExpandedCatId(null);
    }

    function closeAccount() {
        setAccountOpen(false);
    }

    function handleMenuOpen() {
        setMenuOpen(true);
        setTimeout(() => searchRef.current?.focus(), 80);
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        closeMenu();
        router.push(lp(`/search?q=${encodeURIComponent(q)}`));
    }

    useEffect(() => {
        const anyOpen = menuOpen || accountOpen;
        if (!anyOpen) return;
        document.body.style.overflow = 'hidden';

        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setMenuOpen(false);
                setAccountOpen(false);
                setQuery('');
            }
        }
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [menuOpen, accountOpen]);

    useEffect(() => {
        function onOpenMenu() {
            setMenuOpen(true);
            setTimeout(() => searchRef.current?.focus(), 80);
        }
        window.addEventListener('open-mobile-menu', onOpenMenu);
        return () => window.removeEventListener('open-mobile-menu', onOpenMenu);
    }, []);

    useEffect(() => {
        function onOpenAccount() {
            setAccountOpen(true);
        }
        window.addEventListener('open-mobile-account', onOpenAccount);
        return () =>
            window.removeEventListener('open-mobile-account', onOpenAccount);
    }, []);

    return (
        <>
            <button
                type="button"
                onClick={menuOpen ? closeMenu : handleMenuOpen}
                className="hover:bg-accent inline-flex h-9 w-9 items-center justify-center rounded-md md:hidden"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
            >
                {menuOpen ? (
                    <X className="h-5 w-5" />
                ) : (
                    <Menu className="h-5 w-5" />
                )}
            </button>

            {/* ── Menu panel ─────────────────────────────────── */}
            {menuOpen &&
                mounted &&
                createPortal(
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label={t('nav.mobile_menu', 'Navigation menu')}
                        className="bg-background fixed inset-0 flex flex-col overflow-y-auto md:hidden"
                        style={{ zIndex: 200 }}
                    >
                        <div className="border-border flex h-14 shrink-0 items-center justify-between border-b px-4 sm:px-6">
                            <Link
                                href={lp('/')}
                                onClick={closeMenu}
                                className="text-primary text-xl font-bold tracking-tight"
                            >
                                {siteName}
                            </Link>
                            <button
                                type="button"
                                onClick={closeMenu}
                                className="hover:bg-accent inline-flex h-9 w-9 items-center justify-center rounded-md"
                                aria-label={t('nav.close_menu', 'Close menu')}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="border-border border-b px-4 py-3">
                            <form onSubmit={handleSearch} noValidate>
                                <div className="border-border bg-muted/50 flex items-center gap-3 rounded-xl border px-3 py-2.5">
                                    <Search
                                        className="text-muted-foreground h-4 w-4 shrink-0"
                                        aria-hidden="true"
                                    />
                                    <label
                                        htmlFor="mobile-search-input"
                                        className="sr-only"
                                    >
                                        {t('nav.search', 'Search products')}
                                    </label>
                                    <input
                                        id="mobile-search-input"
                                        ref={searchRef}
                                        value={query}
                                        onChange={(e) =>
                                            setQuery(e.target.value)
                                        }
                                        placeholder={t(
                                            'nav.search',
                                            'Search products…',
                                        )}
                                        className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
                                    />
                                    {query && (
                                        <button
                                            type="button"
                                            onClick={() => setQuery('')}
                                            aria-label={t(
                                                'nav.clear_search',
                                                'Clear search',
                                            )}
                                            className="text-muted-foreground"
                                        >
                                            <X
                                                className="h-4 w-4"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {categories.length > 0 && (
                            <div className="border-border border-b">
                                {storefrontRoutes?.product_listing && (
                                    <Link
                                        href={lp(
                                            storefrontRoutes.product_listing,
                                        )}
                                        onClick={closeMenu}
                                        className="border-border flex items-center gap-3 border-b px-4 py-3.5"
                                    >
                                        <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-lg">
                                            <ShoppingBag className="text-muted-foreground h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium">
                                            {t(
                                                'nav.all_products',
                                                'All Products',
                                            )}
                                        </span>
                                    </Link>
                                )}

                                {categories.map((cat) => {
                                    const hasChildren =
                                        (cat.children?.length ?? 0) > 0;
                                    const isExpanded = expandedCatId === cat.id;

                                    return (
                                        <div
                                            key={cat.id}
                                            className="border-border border-b last:border-0"
                                        >
                                            {hasChildren ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setExpandedCatId(
                                                            isExpanded
                                                                ? null
                                                                : cat.id,
                                                        )
                                                    }
                                                    aria-expanded={isExpanded}
                                                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                                                >
                                                    <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                                                        {cat.image_url ? (
                                                            <Image
                                                                src={
                                                                    cat.image_url
                                                                }
                                                                alt={cat.name}
                                                                width={36}
                                                                height={36}
                                                                className="h-9 w-9 object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm font-semibold">
                                                                {cat.name[0]}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="flex-1 text-sm font-medium">
                                                        {cat.name}
                                                    </span>
                                                    <ChevronDown
                                                        className={`text-muted-foreground h-4 w-4 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                            ) : (
                                                <Link
                                                    href={lp(
                                                        resolveCategoryPath(
                                                            cat,
                                                        ),
                                                    )}
                                                    onClick={closeMenu}
                                                    className="flex items-center gap-3 px-4 py-3.5"
                                                >
                                                    <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                                                        {cat.image_url ? (
                                                            <Image
                                                                src={
                                                                    cat.image_url
                                                                }
                                                                alt={cat.name}
                                                                width={36}
                                                                height={36}
                                                                className="h-9 w-9 object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm font-semibold">
                                                                {cat.name[0]}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        {cat.name}
                                                    </span>
                                                </Link>
                                            )}

                                            {hasChildren && isExpanded && (
                                                <div className="bg-muted/30 px-4 pb-3">
                                                    <Link
                                                        href={lp(
                                                            resolveCategoryPath(
                                                                cat,
                                                            ),
                                                        )}
                                                        onClick={closeMenu}
                                                        className="text-primary mb-2 block py-1.5 text-xs font-medium"
                                                    >
                                                        {t(
                                                            'nav.view_all_in',
                                                            `All in ${cat.name} →`,
                                                        )}
                                                    </Link>
                                                    <div className="grid grid-cols-2 gap-1">
                                                        {cat.children!.map(
                                                            (child) => (
                                                                <Link
                                                                    key={
                                                                        child.id
                                                                    }
                                                                    href={lp(
                                                                        resolveCategoryPath(
                                                                            child,
                                                                        ),
                                                                    )}
                                                                    onClick={
                                                                        closeMenu
                                                                    }
                                                                    className="hover:bg-accent flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm"
                                                                >
                                                                    <div className="bg-background flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md">
                                                                        {child.image_url ? (
                                                                            <Image
                                                                                src={
                                                                                    child.image_url
                                                                                }
                                                                                alt={
                                                                                    child.name
                                                                                }
                                                                                width={
                                                                                    28
                                                                                }
                                                                                height={
                                                                                    28
                                                                                }
                                                                                className="h-7 w-7 object-cover"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-muted-foreground text-[10px] font-semibold">
                                                                                {
                                                                                    child
                                                                                        .name[0]
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-foreground/80 text-xs leading-tight">
                                                                        {
                                                                            child.name
                                                                        }
                                                                    </span>
                                                                </Link>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {items.length > 0 && (
                            <nav
                                aria-label={t(
                                    'nav.main_navigation',
                                    'Main navigation',
                                )}
                                className="border-border border-b px-4 py-2"
                            >
                                {items.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={localiseUrl(item.url, lp)}
                                        onClick={closeMenu}
                                        className="text-foreground/80 hover:text-foreground [&:not(:last-child)]:border-border/60 flex items-center py-3.5 text-base font-medium [&:not(:last-child)]:border-b"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        )}

                        <div className="border-border mt-auto border-t px-4 py-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-xs">
                                    {t('nav.language', 'Language & Theme')}
                                </span>
                                <div className="flex items-center gap-2">
                                    <LocaleSwitcher />
                                    <ThemeToggle />
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}

            {/* ── Account panel ───────────────────────────────── */}
            {accountOpen &&
                mounted &&
                createPortal(
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label={t('nav.account', 'Account')}
                        className="bg-background fixed inset-0 flex flex-col overflow-y-auto md:hidden"
                        style={{ zIndex: 200 }}
                    >
                        <div className="border-border flex h-14 shrink-0 items-center justify-between border-b px-4 sm:px-6">
                            <span className="text-foreground text-lg font-semibold">
                                {t('nav.account', 'Account')}
                            </span>
                            <button
                                type="button"
                                onClick={closeAccount}
                                className="hover:bg-accent inline-flex h-9 w-9 items-center justify-center rounded-md"
                                aria-label={t('nav.close_menu', 'Close menu')}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 px-4 py-4">
                            {user ? (
                                <>
                                    <div className="border-border bg-muted/30 mb-3 flex items-center gap-3 rounded-xl border px-3 py-3">
                                        <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                                            {user.name?.[0]?.toUpperCase() ??
                                                'U'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">
                                                {user.name}
                                            </p>
                                            <p className="text-muted-foreground truncate text-xs">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Link
                                            href={lp('/account/orders')}
                                            onClick={closeAccount}
                                            className="hover:bg-accent flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium"
                                        >
                                            <Package className="text-muted-foreground h-4 w-4" />
                                            {t(
                                                'account.my_orders',
                                                'My Orders',
                                            )}
                                        </Link>
                                        <Link
                                            href={lp('/wishlist')}
                                            onClick={closeAccount}
                                            className="hover:bg-accent flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium"
                                        >
                                            <Heart className="text-muted-foreground h-4 w-4" />
                                            {t('account.wishlist', 'Wishlist')}
                                        </Link>
                                        <Link
                                            href={lp('/account/profile')}
                                            onClick={closeAccount}
                                            className="hover:bg-accent flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium"
                                        >
                                            <User className="text-muted-foreground h-4 w-4" />
                                            {t('nav.profile', 'Profile')}
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                closeAccount();
                                                logout();
                                            }}
                                            className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            {t('account.sign_out', 'Sign out')}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Link
                                        href={lp('/login')}
                                        onClick={closeAccount}
                                        className="bg-primary text-primary-foreground flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold"
                                    >
                                        {t('nav.login', 'Sign in')}
                                    </Link>
                                    <Link
                                        href={lp('/register')}
                                        onClick={closeAccount}
                                        className="border-border hover:bg-accent flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold"
                                    >
                                        {t('auth.sign_up', 'Create account')}
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="border-border mt-auto border-t px-4 py-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-xs">
                                    {t('nav.language', 'Language & Theme')}
                                </span>
                                <div className="flex items-center gap-2">
                                    <LocaleSwitcher />
                                    <ThemeToggle />
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    );
}
