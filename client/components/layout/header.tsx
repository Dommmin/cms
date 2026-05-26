import { cookies, headers } from 'next/headers';
import Link from 'next/link';

import { getCategories, getMenu } from '@/api/cms';
import type { Category, MenuItem } from '@/types/api';

import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { MegaMenu } from '@/components/layout/mega-menu';
import { AuthButton } from './auth-button';
import { CartButton } from './cart-button';
import { HeaderClient } from './header-client';
import type { HeaderProps } from './header.types';
import { MobileMenu } from './mobile-menu';
import { SearchBar } from './search-bar';
import { ThemeToggle } from './theme-toggle';
import { WishlistButton } from './wishlist-button';

export async function Header({ modules, siteName = 'Store' }: HeaderProps) {
    const [headersList, cookieStore] = await Promise.all([
        headers(),
        cookies(),
    ]);
    // x-locale is set by middleware on the current request, so it's always up to date
    // even on the first navigation to a new locale (before the cookie is sent back).
    const locale =
        headersList.get('x-locale') ?? cookieStore.get('locale')?.value ?? 'en';

    let items: MenuItem[] = [];
    let categories: Category[] = [];

    await Promise.allSettled([
        getMenu('header', locale).then((menu) => {
            items = menu.items ?? [];
        }),
        ...(modules?.ecommerce
            ? [
                  getCategories().then((cats) => {
                      categories = cats;
                  }),
              ]
            : []),
    ]);

    const top = (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
                <div className="hidden flex-1 items-center justify-start md:flex">
                    <LocaleSwitcher />
                </div>
                <Link
                    href={`/${locale}`}
                    className="text-primary shrink-0 text-xl font-bold tracking-tight"
                >
                    {siteName}
                </Link>
                <div className="flex flex-1 items-center justify-end">
                    <div className="flex items-center gap-2">
                        {modules?.ecommerce && <SearchBar />}
                        <div className="hidden md:block">
                            <ThemeToggle />
                        </div>

                        {modules?.ecommerce && (
                            <>
                                <span className="hidden md:block">
                                    <WishlistButton />
                                </span>
                                <span className="hidden md:block">
                                    <CartButton />
                                </span>
                            </>
                        )}

                        <AuthButton />

                        <MobileMenu
                            items={items}
                            categories={modules?.ecommerce ? categories : []}
                            siteName={siteName}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const bottom = (
        <div className="mx-auto flex max-w-7xl justify-center px-4 py-0 sm:px-6 lg:px-8">
            <MegaMenu
                items={items}
                categories={modules?.ecommerce ? categories : []}
            />
        </div>
    );

    return <HeaderClient top={top} bottom={bottom} />;
}
