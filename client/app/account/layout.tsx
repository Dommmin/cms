'use client';

import { Heart, LogOut, Package, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useLogout, useMe } from '@/hooks/use-auth';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';
import { getToken } from '@/lib/axios';
import { stripLocaleFromPath } from '@/lib/i18n';

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: user, isLoading } = useMe();
    const { mutate: logout } = useLogout();
    const pathname = usePathname();
    const lp = useLocalePath();
    const { t } = useTranslation();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const NAV_LINKS = [
        {
            href: '/account/orders',
            label: t('account.my_orders', 'Orders'),
            icon: Package,
        },
        {
            href: '/account/wishlist',
            label: t('account.wishlist', 'Wishlist'),
            icon: Heart,
        },
        {
            href: '/account/profile',
            label: t('nav.profile', 'Profile'),
            icon: User,
        },
    ];

    // Strip locale prefix before comparing against href
    const pathWithoutLocale = stripLocaleFromPath(pathname);

    useEffect(() => {
        void Promise.resolve().then(() => setMounted(true));
        if (!getToken()) {
            router.push(lp('/login'));
        }
    }, [lp, router]);

    // Show skeleton until mounted (avoids hydration mismatch from typeof window checks)
    if (!mounted || isLoading) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="bg-muted h-8 w-48 animate-pulse rounded" />
            </div>
        );
    }

    if (!user) {
        router.push(lp('/login'));
        return null;
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                {/* Sidebar */}
                <aside className="lg:col-span-1">
                    <div className="border-border bg-card rounded-xl border p-4">
                        <div className="border-border mb-4 border-b pb-4">
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-muted-foreground text-sm">
                                {user.email}
                            </p>
                        </div>
                        <nav className="space-y-1">
                            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                                const isActive =
                                    pathWithoutLocale.startsWith(href);
                                return (
                                    <Link
                                        key={href}
                                        href={lp(href)}
                                        aria-current={
                                            isActive ? 'page' : undefined
                                        }
                                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                        }`}
                                    >
                                        <Icon
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        />
                                        {label}
                                    </Link>
                                );
                            })}
                            <button
                                onClick={() => logout()}
                                className="text-muted-foreground hover:bg-accent hover:text-foreground flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
                            >
                                <LogOut className="h-4 w-4" />
                                {t('account.sign_out', 'Sign out')}
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main content */}
                <main className="lg:col-span-3">{children}</main>
            </div>
        </div>
    );
}
