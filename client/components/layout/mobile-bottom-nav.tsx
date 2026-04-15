'use client';
import { Grid3X3, Heart, Home, Search, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useLocalePath } from '@/hooks/use-locale';

const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Grid3X3, label: 'Sklep', href: '/products' },
    { icon: Search, label: 'Szukaj', href: '/search' },
    { icon: Heart, label: 'Lista', href: '/account/wishlist' },
    { icon: User, label: 'Konto', href: '/account' },
] as const;

export function MobileBottomNav() {
    const pathname = usePathname();
    const lp = useLocalePath();

    return (
        <nav
            aria-label="Mobile navigation"
            className="bg-background/95 border-border fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t px-2 py-2 backdrop-blur-xl md:hidden"
        >
            {navItems.map(({ icon: Icon, label, href }) => {
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
