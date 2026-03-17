"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Package, User, LogOut } from "lucide-react";

import { useMe, useLogout } from "@/hooks/use-auth";
import { getToken } from "@/lib/axios";
import { useLocalePath } from "@/hooks/use-locale";
import { useTranslation } from "@/hooks/use-translation";
import { stripLocaleFromPath } from "@/lib/i18n";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useMe();
  const { mutate: logout } = useLogout();
  const pathname = usePathname();
  const lp = useLocalePath();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  const NAV_LINKS = [
    { href: "/account/orders", label: t("account.my_orders", "Orders"), icon: Package },
    { href: "/account/wishlist", label: t("account.wishlist", "Wishlist"), icon: Heart },
    { href: "/account/profile", label: t("nav.profile", "Profile"), icon: User },
  ];

  // Strip locale prefix before comparing against href
  const pathWithoutLocale = stripLocaleFromPath(pathname);

  useEffect(() => {
    setMounted(true);
    if (!getToken()) {
      window.location.href = lp("/login");
    }
  }, [lp]);

  // Show skeleton until mounted (avoids hydration mismatch from typeof window checks)
  if (!mounted || isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!user) {
    window.location.href = lp("/login");
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-4 border-b border-border pb-4">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <nav className="space-y-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={lp(href)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    pathWithoutLocale.startsWith(href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
              <button
                onClick={() => logout()}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                {t("account.sign_out", "Sign out")}
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
