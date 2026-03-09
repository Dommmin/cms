import Link from "next/link";
import { cookies, headers } from "next/headers";

import { getCategories, getMenu } from "@/api/cms";
import type { Category, MenuItem } from "@/types/api";

import { AuthButton } from "./auth-button";
import { CartButton } from "./cart-button";
import { LocaleSwitcher } from "./locale-switcher";
import { MegaMenu } from "./mega-menu";
import { MobileMenu } from "./mobile-menu";
import { SearchBar } from "./search-bar";
import { ThemeToggle } from "./theme-toggle";

export async function Header() {
  const [headersList, cookieStore] = await Promise.all([headers(), cookies()]);
  // x-locale is set by middleware on the current request, so it's always up to date
  // even on the first navigation to a new locale (before the cookie is sent back).
  const locale = headersList.get("x-locale") ?? cookieStore.get("locale")?.value ?? "en";

  let items: MenuItem[] = [];
  let categories: Category[] = [];

  await Promise.allSettled([
    getMenu("header", locale).then((menu) => {
      items = menu.items ?? [];
    }),
    getCategories().then((cats) => {
      categories = cats;
    }),
  ]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="shrink-0 text-xl font-bold tracking-tight text-primary">
          Store
        </Link>

        {/* Desktop mega menu */}
        <MegaMenu items={items} categories={categories} />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <SearchBar />
          <LocaleSwitcher />
          <ThemeToggle />
          <CartButton />
          <AuthButton />
          {/* Mobile menu trigger */}
          <MobileMenu items={items} categories={categories} />
        </div>
      </div>
    </header>
  );
}
