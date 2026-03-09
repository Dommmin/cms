import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    href: string;
};

export type NavItem = {
    title: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
} & (
    | {
          href: NonNullable<InertiaLinkProps['href']>;
          children?: never;
      }
    | {
          href?: never;
          children: NavItem[];
      }
);
