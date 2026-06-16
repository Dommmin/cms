import { cookies, headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

import { getCategories, getMenu } from '@/api/cms';
import type { Category, MenuItem } from '@/types/api';

import { MegaMenu } from '@/components/layout/mega-menu';
import { AuthButton } from './auth-button';
import { CartButton } from './cart-button';
import { HeaderClient } from './header-client';
import type { HeaderProps } from './header.types';
import { MobileMenu } from './mobile-menu';
import { SearchBar } from './search-bar';
import { ThemeToggle } from './theme-toggle';
import { WishlistButton } from './wishlist-button';

export async function Header({
    modules,
    siteName = 'Store',
    logoUrl,
}: HeaderProps) {
    const [headersList, cookieStore] = await Promise.all([
        headers(),
        cookies(),
    ]);
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

    return (
        <HeaderClient>
            <div className="store-shell mx-auto flex w-full items-center gap-6 px-4 sm:px-6 lg:px-8">
                <Link
                    href={`/${locale}`}
                    className="text-primary flex shrink-0 items-center gap-2 text-xl font-bold tracking-tight"
                >
                    {logoUrl ? (
                        <Image
                            src={logoUrl}
                            alt={siteName}
                            width={120}
                            height={32}
                            className="h-8 w-auto object-contain"
                        />
                    ) : (
                        siteName
                    )}
                </Link>

                <div className="hidden flex-1 justify-center md:flex">
                    <MegaMenu
                        items={items}
                        categories={modules?.ecommerce ? categories : []}
                    />
                </div>

                <div className="ml-auto flex items-center gap-2">
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
        </HeaderClient>
    );
}
