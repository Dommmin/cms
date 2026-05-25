'use client';
import { Grid3X3, Heart, Home, Search, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';

export function MobileBottomNav() {
    const pathname = usePathname();
    const lp = useLocalePath();
    const { t } = useTranslation();

    const navItems = [
        { icon: Home, label: t('nav.home', 'Home'), href: '/' },
        { icon: Grid3X3, label: t('nav.shop', 'Sklep'), href: '/products' },
        {
            icon: Search,
            label: t('nav.search', 'Szukaj'),
            action: 'search' as const,
        },
        {
            icon: Heart,
            label: t('nav.wishlist', 'Lista'),
            href: '/account/wishlist',
        },
        { icon: User, label: t('nav.account', 'Konto'), href: '/account' },
    ] as const;

    return (
        <nav
            aria-label="Mobile navigation"
            className="bg-background/95 border-border fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t px-2 py-2 backdrop-blur-xl md:hidden"
        >
            {navItems.map((item) => {
                const Icon = item.icon;

                if ('action' in item && item.action === 'search') {
                    return (
                        <button
                            key={item.action}
                            type="button"
                            onClick={() =>
                                window.dispatchEvent(
                                    new CustomEvent('open-search'),
                                )
                            }
                            className="text-muted-foreground hover:text-foreground flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition-colors"
                            aria-label={item.label}
                        >
                            <Icon className="h-5 w-5" aria-hidden="true" />
                            <span className="text-[10px] font-medium">
                                {item.label}
                            </span>
                        </button>
                    );
                }

                const { href, label } = item as {
                    href: string;
                    label: string;
                    icon: typeof Icon;
                };
                const localHref = lp(href);
                const isActive =
                    pathname === localHref ||
                    (href !== '/' && pathname.startsWith(localHref));
                return (
                    <Link
                        key={href}
                        href={localHref}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition-colors ${
                            isActive
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                        <span className="text-[10px] font-medium">{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
