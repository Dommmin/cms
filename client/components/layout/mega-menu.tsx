'use client';

import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';
import type { MegaMenuProps, OpenKey } from './mega-menu.types';

/** Apply locale prefix to internal paths; leave external URLs (http//) untouched. */
function localiseUrl(url: string | null | undefined, lp: (path: string) => string): string {
  if (!url || url === '#') return '#';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) return url;
  return lp(url);
}

export function MegaMenu({ items, categories }: MegaMenuProps) {
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
          onMouseEnter={() => open('categories')}
          onMouseLeave={scheduleClose}
        >
          <button className="text-foreground/80 hover:bg-accent hover:text-foreground flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors">
            {t('nav.categories', 'Categories')}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${openKey === 'categories' ? 'rotate-180' : ''}`}
            />
          </button>

          {openKey === 'categories' && (
            <div
              className="border-border bg-background fixed top-16 right-0 left-0 z-40 border-t shadow-xl"
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <p className="text-muted-foreground mb-4 text-xs font-semibold tracking-wide uppercase">
                  {t('nav.shop_by_category', 'Shop by category')}
                </p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={lp(`/products?category=${cat.slug}`)}
                      onClick={() => setOpenKey(null)}
                      className="group hover:bg-accent flex flex-col items-center rounded-xl p-3 text-center"
                    >
                      <div className="bg-muted mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full">
                        {cat.image_url ? (
                          <Image
                            src={cat.image_url}
                            alt={cat.name}
                            width={56}
                            height={56}
                            className="h-14 w-14 object-cover"
                          />
                        ) : (
                          <span className="text-muted-foreground text-xl font-medium">
                            {cat.name[0]}
                          </span>
                        )}
                      </div>
                      <span className="text-foreground/80 group-hover:text-foreground text-xs font-medium">
                        {cat.name}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* View all link */}
                <div className="border-border mt-6 border-t pt-4">
                  <Link
                    href={lp('/products')}
                    onClick={() => setOpenKey(null)}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    {t('nav.view_all_products', 'View all products →')}
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
            className="text-foreground/80 hover:bg-accent hover:text-foreground flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors"
          >
            {item.label}
            {item.children?.length ? (
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${openKey === item.id ? 'rotate-180' : ''}`}
              />
            ) : null}
          </Link>

          {item.children?.length && openKey === item.id ? (
            <div
              className="border-border bg-background absolute top-full left-0 z-40 mt-1 min-w-48 rounded-xl border shadow-lg"
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
                    className="text-foreground/80 hover:bg-accent hover:text-foreground block rounded-lg px-3 py-2 text-sm"
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
