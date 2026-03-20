"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { useLocalePath } from "@/hooks/use-locale";
import { useTranslation } from "@/hooks/use-translation";
import type { Category, MenuItem } from "@/types/api";

interface Props {
  items: MenuItem[];
  categories: Category[];
}

/** Apply locale prefix to internal paths; leave external URLs (http//) untouched. */
function localiseUrl(url: string | null | undefined, lp: (path: string) => string): string {
  if (!url || url === "#") return "#";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//")) return url;
  return lp(url);
}

type OpenKey = number | "categories" | null;

export function MegaMenu({ items, categories }: Props) {
  const [openKey, setOpenKey] = useState<OpenKey>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lp = useLocalePath();
  const { t } = useTranslation();

  function open(key: OpenKey) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenKey(key);
  }

  function scheduleClose() {
    timeoutRef.current = setTimeout(() => setOpenKey(null), 120);
  }

  function cancelClose() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {/* Categories mega item */}
      {categories.length > 0 && (
        <div
          className="relative"
          onMouseEnter={() => open("categories")}
          onMouseLeave={scheduleClose}
        >
          <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground">
            {t("nav.categories", "Categories")}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${openKey === "categories" ? "rotate-180" : ""}`}
            />
          </button>

          {openKey === "categories" && (
            <div
              className="fixed left-0 right-0 top-16 z-40 border-t border-border bg-background shadow-xl"
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("nav.shop_by_category", "Shop by category")}
                </p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={lp(`/products?category=${cat.slug}`)}
                      onClick={() => setOpenKey(null)}
                      className="group flex flex-col items-center rounded-xl p-3 text-center hover:bg-accent"
                    >
                      <div className="mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-muted">
                        {cat.image_url ? (
                          <Image
                            src={cat.image_url}
                            alt={cat.name}
                            width={56}
                            height={56}
                            className="h-14 w-14 object-cover"
                          />
                        ) : (
                          <span className="text-xl font-medium text-muted-foreground">
                            {cat.name[0]}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground">
                        {cat.name}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* View all link */}
                <div className="mt-6 border-t border-border pt-4">
                  <Link
                    href={lp("/products")}
                    onClick={() => setOpenKey(null)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {t("nav.view_all_products", "View all products →")}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CMS menu items */}
      {items.map((item) => (
        <div
          key={item.id}
          className="relative"
          onMouseEnter={() => (item.children?.length ? open(item.id) : undefined)}
          onMouseLeave={scheduleClose}
        >
          <Link
            href={localiseUrl(item.url, lp)}
            target={item.target}
            className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
          >
            {item.label}
            {item.children?.length ? (
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${openKey === item.id ? "rotate-180" : ""}`}
              />
            ) : null}
          </Link>

          {item.children?.length && openKey === item.id ? (
            <div
              className="absolute left-0 top-full z-40 mt-1 min-w-48 rounded-xl border border-border bg-background shadow-lg"
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              <div className="p-1">
                {item.children.map((child) => (
                  <Link
                    key={child.id}
                    href={localiseUrl(child.url, lp)}
                    target={child.target}
                    onClick={() => setOpenKey(null)}
                    className="block rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-foreground"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </nav>
  );
}
