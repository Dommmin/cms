"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, LogOut, Menu, Package, User, X } from "lucide-react";

import { useLogout, useMe } from "@/hooks/use-auth";
import { useLocalePath } from "@/hooks/use-locale";
import { useTranslation } from "@/hooks/use-translation";
import type { Category, MenuItem } from "@/types/api";

interface Props {
  items: MenuItem[];
  categories: Category[];
}

export function MobileMenu({ items, categories }: Props) {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { data: user } = useMe();
  const { mutate: logout } = useLogout();
  const { t } = useTranslation();
  const lp = useLocalePath();

  function close() {
    setOpen(false);
    setCategoriesOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={close} />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-80 flex-col bg-background shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <span className="text-lg font-semibold">Menu</span>
          <button
            onClick={close}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Categories accordion */}
          {categories.length > 0 && (
            <div className="border-b border-border">
              <button
                onClick={() => setCategoriesOpen((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground"
              >
                Categories
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${categoriesOpen ? "rotate-180" : ""}`}
                />
              </button>
              {categoriesOpen && (
                <div className="grid grid-cols-3 gap-2 px-4 pb-4">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={lp(`/products?category=${cat.slug}`)}
                      onClick={close}
                      className="flex flex-col items-center rounded-xl p-2 text-center hover:bg-accent"
                    >
                      <div className="mb-1 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted">
                        {cat.image_url ? (
                          <Image
                            src={cat.image_url}
                            alt={cat.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-muted-foreground">
                            {cat.name[0]}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-foreground/80">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CMS nav items */}
          <nav className="flex flex-col px-4 py-2">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.url ?? "#"}
                onClick={close}
                className="border-b border-border py-3 text-sm font-medium text-foreground/80 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* User section */}
        <div className="border-t border-border px-4 py-4">
          {user ? (
            <div className="space-y-1">
              <p className="mb-2 truncate text-xs font-semibold text-muted-foreground">
                {user.email}
              </p>
              <Link
                href={lp("/account/orders")}
                onClick={close}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-accent"
              >
                <Package className="h-4 w-4 text-muted-foreground" />
                {t("account.my_orders", "My Orders")}
              </Link>
              <Link
                href={lp("/account/profile")}
                onClick={close}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-accent"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                {t("nav.profile", "Profile")}
              </Link>
              <button
                onClick={() => {
                  close();
                  logout();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                {t("account.sign_out", "Sign out")}
              </button>
            </div>
          ) : (
            <Link
              href={lp("/login")}
              onClick={close}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium hover:bg-accent"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              {t("nav.login", "Login")}
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
