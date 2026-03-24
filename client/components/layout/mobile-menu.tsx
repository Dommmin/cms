"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

import { useLogout, useMe } from "@/hooks/use-auth";
import { useLocalePath } from "@/hooks/use-locale";
import { useTranslation } from "@/hooks/use-translation";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { Category, MenuItem } from "@/types/api";
import type { MobileMenuProps } from './mobile-menu.types';

function localiseUrl(url: string | null | undefined, lp: (path: string) => string): string {
  if (!url || url === "#") return "#";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//")) return url;
  return lp(url);
}

export function MobileMenu({ items, categories }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { data: user } = useMe();
  const { mutate: logout } = useLogout();
  const { t } = useTranslation();
  const lp = useLocalePath();

  function close() {
    setOpen(false);
    setQuery("");
  }

  function handleOpen() {
    setOpen(true);
    setTimeout(() => searchRef.current?.focus(), 80);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    close();
    router.push(lp(`/search?q=${encodeURIComponent(q)}`));
  }

  useEffect(() => { setMounted(true); }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    // Prevent body scroll while open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Hamburger / Close trigger */}
      <button
        type="button"
        onClick={open ? close : handleOpen}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent md:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Full-screen panel — rendered via portal to escape header stacking context */}
      {open && mounted && createPortal(
        <div className="fixed inset-x-0 top-16 bottom-0 z-[200] flex flex-col overflow-y-auto bg-background md:hidden">

          {/* ── Search ─────────────────────────────────────── */}
          <div className="border-b border-border px-4 py-3">
            <form onSubmit={handleSearch} noValidate>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-3 py-2.5">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("nav.search", "Search products…")}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ── Categories ─────────────────────────────────── */}
          {categories.length > 0 && (
            <div className="border-b border-border px-4 py-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("nav.categories", "Categories")}
              </p>
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {/* "All products" tile */}
                <Link
                  href={lp("/products")}
                  onClick={close}
                  className="flex shrink-0 flex-col items-center gap-1.5"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <span className="max-w-[56px] text-center text-[11px] leading-tight text-foreground/80">
                    {t("nav.all", "All")}
                  </span>
                </Link>

                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={lp(`/products?category=${cat.slug}`)}
                    onClick={close}
                    className="flex shrink-0 flex-col items-center gap-1.5"
                  >
                    <div className="h-14 w-14 overflow-hidden rounded-2xl border border-border bg-muted">
                      {cat.image_url ? (
                        <Image
                          src={cat.image_url}
                          alt={cat.name}
                          width={56}
                          height={56}
                          className="h-14 w-14 object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center text-lg font-semibold text-muted-foreground">
                          {cat.name[0]}
                        </div>
                      )}
                    </div>
                    <span className="max-w-[56px] text-center text-[11px] leading-tight text-foreground/80">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── CMS nav links ───────────────────────────────── */}
          {items.length > 0 && (
            <nav className="border-b border-border px-4 py-2">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={localiseUrl(item.url, lp)}
                  onClick={close}
                  className="flex items-center py-3.5 text-base font-medium text-foreground/80 hover:text-foreground [&:not(:last-child)]:border-b [&:not(:last-child)]:border-border/60"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* ── Account ────────────────────────────────────── */}
          <div className="px-4 py-4">
            {user ? (
              <>
                {/* User info */}
                <div className="mb-3 flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {user.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Link
                    href={lp("/account/orders")}
                    onClick={close}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-accent"
                  >
                    <Package className="h-4 w-4 text-muted-foreground" />
                    {t("account.my_orders", "My Orders")}
                  </Link>
                  <Link
                    href={lp("/account/wishlist")}
                    onClick={close}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-accent"
                  >
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    {t("account.wishlist", "Wishlist")}
                  </Link>
                  <Link
                    href={lp("/account/profile")}
                    onClick={close}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-accent"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    {t("nav.profile", "Profile")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => { close(); logout(); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("account.sign_out", "Sign out")}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href={lp("/login")}
                  onClick={close}
                  className="flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                >
                  {t("nav.login", "Sign in")}
                </Link>
                <Link
                  href={lp("/register")}
                  onClick={close}
                  className="flex items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-accent"
                >
                  {t("auth.sign_up", "Create account")}
                </Link>
              </div>
            )}
          </div>

          {/* ── Bottom bar: locale + theme ──────────────────── */}
          <div className="mt-auto border-t border-border px-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {t("nav.language", "Language & Theme")}
              </span>
              <div className="flex items-center gap-2">
                <LocaleSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </div>

        </div>,
        document.body
      )}
    </>
  );
}
