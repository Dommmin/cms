'use client';
import { Heart, Home, Search, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { Modules } from '@/app/layout.types';
import { useCart } from '@/hooks/use-cart';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';

interface MobileBottomNavProps {
    modules?: Modules;
}

export function MobileBottomNav({ modules }: MobileBottomNavProps) {
    const pathname = usePathname();
    const lp = useLocalePath();
    const { t } = useTranslation();
    const { data: cart } = useCart();
    const cartCount = cart?.items_count ?? 0;

    const homeHref = lp('/');
    const isHomeActive = pathname === homeHref;
    const isWishlistActive = pathname.startsWith('/account/wishlist');

    function openSearch() {
        window.dispatchEvent(new CustomEvent('open-search'));
    }

    function openAccount() {
        window.dispatchEvent(new CustomEvent('open-mobile-account'));
    }

    return (
        <nav
            aria-label="Mobile navigation"
            className="bg-background/95 border-border fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t px-2 py-2 backdrop-blur-xl md:hidden"
        >
            <Link
                href={homeHref}
                aria-current={isHomeActive ? 'page' : undefined}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition-colors ${
                    isHomeActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                }`}
            >
                <Home className="h-5 w-5" aria-hidden="true" />
                <span className="text-[10px] font-medium">
                    {t('nav.home', 'Home')}
                </span>
            </Link>

            <button
                type="button"
                onClick={openSearch}
                className="text-muted-foreground hover:text-foreground flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition-colors"
                aria-label={t('nav.search', 'Search')}
            >
                <Search className="h-5 w-5" aria-hidden="true" />
                <span className="text-[10px] font-medium">
                    {t('nav.search', 'Search')}
                </span>
            </button>

            {modules?.ecommerce && (
                <Link
                    href={lp('/cart')}
                    className="text-muted-foreground hover:text-foreground relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition-colors"
                    aria-label={
                        cartCount > 0
                            ? t('nav.cart_with_items', `Cart (${cartCount})`)
                            : t('nav.cart', 'Cart')
                    }
                >
                    <div className="bg-primary text-primary-foreground relative flex h-10 w-10 items-center justify-center rounded-full">
                        <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                        {cartCount > 0 && (
                            <span className="bg-primary-foreground text-primary absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] leading-none font-bold">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] font-medium">
                        {t('nav.cart', 'Cart')}
                    </span>
                </Link>
            )}

            {modules?.ecommerce && (
                <Link
                    href={lp('/account/wishlist')}
                    aria-current={isWishlistActive ? 'page' : undefined}
                    className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition-colors ${
                        isWishlistActive
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Heart className="h-5 w-5" aria-hidden="true" />
                    <span className="text-[10px] font-medium">
                        {t('nav.wishlist', 'Wishlist')}
                    </span>
                </Link>
            )}

            <button
                type="button"
                onClick={openAccount}
                className="text-muted-foreground hover:text-foreground flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition-colors"
                aria-label={t('nav.account', 'Account')}
            >
                <User className="h-5 w-5" aria-hidden="true" />
                <span className="text-[10px] font-medium">
                    {t('nav.account', 'Account')}
                </span>
            </button>
        </nav>
    );
}
