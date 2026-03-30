import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

import type { BreadcrumbProps } from './breadcrumb.types';

export function Breadcrumb({ items, homeHref = '/' }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="text-muted-foreground flex flex-wrap items-center gap-1 text-sm">
        <li>
          <Link
            href={homeHref}
            className="hover:text-foreground flex items-center transition-colors"
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-foreground max-w-[200px] truncate transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className="text-foreground max-w-[200px] truncate font-medium"
                aria-current="page"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
