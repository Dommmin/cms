'use client';
import { Heart, Home, Search, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import type { Modules } from '@/app/layout.types';
import { useCart } from '@/hooks/use-cart';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';
import { useWishlist } from '@/hooks/use-wishlist';
import { stripLocaleFromPath } from '@/lib/i18n';

interface MobileBottomNavProps {
    modules?: Modules;
}

export function MobileBottomNav({ modules }: MobileBottomNavProps) {
    const pathname = usePathname();
    const lp = useLocalePath();
    const { t } = useTranslation();
    const { data: cart } = useCart();
    const { data: wishlist } = useWishlist();
    const cartCount = cart?.items_count ?? 0;
    const wishlistCount = wishlist?.items?.length ?? 0;

    const [cartBounce, setCartBounce] = useState(false);
    const [wishlistBounce, setWishlistBounce] = useState(false);
    const prevCartCount = useRef(cartCount);
    const prevWishlistCount = useRef(wishlistCount);

    useEffect(() => {
        if (cartCount > prevCartCount.current) {
            const startId = setTimeout(() => setCartBounce(true), 0);
            const endId = setTimeout(() => setCartBounce(false), 600);
            prevCartCount.current = cartCount;
            return () => {
                clearTimeout(startId);
                clearTimeout(endId);
            };
        }
        prevCartCount.current = cartCount;
    }, [cartCount]);

    useEffect(() => {
        if (wishlistCount > prevWishlistCount.current) {
            const startId = setTimeout(() => setWishlistBounce(true), 0);
            const endId = setTimeout(() => setWishlistBounce(false), 600);
            prevWishlistCount.current = wishlistCount;
            return () => {
                clearTimeout(startId);
                clearTimeout(endId);
            };
        }
        prevWishlistCount.current = wishlistCount;
    }, [wishlistCount]);

    const homeHref = lp('/');
    const isHomeActive = pathname === homeHref;
    const pathWithoutLocale = stripLocaleFromPath(pathname);
    const isWishlistActive = pathWithoutLocale === '/wishlist';

    function openSearch() {
        window.dispatchEvent(new CustomEvent('open-search'));
    }

    function openAccount() {
        window.dispatchEvent(new CustomEvent('open-mobile-account'));
    }

    return (
        <nav
            aria-label="Mobile navigation"
            className="bg-background/95 border-border fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t px-2 py-2 [padding-bottom:calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden"
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
                    className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition-colors ${
                        pathname === lp('/cart')
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                    aria-label={
                        cartCount > 0
                            ? t('nav.cart_with_items', `Cart (${cartCount})`)
                            : t('nav.cart', 'Cart')
                    }
                >
                    <span className="relative inline-flex h-6 w-6 items-center justify-center">
                        <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                        {cartCount > 0 && (
                            <span
                                className={`bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[7px] leading-none font-bold transition-transform duration-150 ${cartBounce ? 'scale-125' : 'scale-100'}`}
                            >
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </span>
                    <span className="text-[10px] font-medium">
                        {t('nav.cart', 'Cart')}
                    </span>
                </Link>
            )}

            {modules?.ecommerce && (
                <Link
                    href={lp('/wishlist')}
                    aria-current={isWishlistActive ? 'page' : undefined}
                    className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition-colors ${
                        isWishlistActive
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                    aria-label={
                        wishlistCount > 0
                            ? t(
                                  'nav.wishlist_with_items',
                                  `Wishlist (${wishlistCount})`,
                              )
                            : t('nav.wishlist', 'Wishlist')
                    }
                >
                    <span className="relative inline-flex h-6 w-6 items-center justify-center">
                        <Heart className="h-5 w-5" aria-hidden="true" />
                        {wishlistCount > 0 && (
                            <span
                                className={`bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[7px] leading-none font-bold transition-transform duration-150 ${wishlistBounce ? 'scale-125' : 'scale-100'}`}
                            >
                                {wishlistCount > 99 ? '99+' : wishlistCount}
                            </span>
                        )}
                    </span>
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
