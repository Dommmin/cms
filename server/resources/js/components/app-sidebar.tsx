import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ClipboardList,
    Folder,
    FolderOpen,
    Image,
    LayoutGrid,
    LibraryBig,
    Settings,
    Users,
    ShoppingBag,
    Package,
    ShoppingCart,
    ChevronRight,
    Tag,
    Box,
    List,
    UserCircle,
    Percent,
    Receipt,
    Truck,
    RotateCcw,
    Mail,
    Users2,
    Megaphone,
    Coins,
    ArrowRightLeft,
    Menu,
    Palette,
    Bell,
    HelpCircle,
    Cookie,
    Flag,
    Languages,
    Link2,
    GitBranch,
    MapPin,
    Activity,
    MessageCircle,
    MessageSquare,
} from 'lucide-react';

import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarGroup,
} from '@/components/ui/sidebar';

import { dashboard } from '@/routes/admin';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const baseNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Media',
        href: '/admin/media',
        icon: Image,
    },
    {
        title: 'CMS',
        icon: Folder,
        children: [
            {
                title: 'Pages',
                href: '/admin/cms/pages',
                icon: LayoutGrid,
            },
            {
                title: 'Global Blocks',
                href: '/admin/cms/reusable-blocks',
                icon: LibraryBig,
            },
            {
                title: 'Menus',
                href: '/admin/menus',
                icon: Menu,
            },
            {
                title: 'Themes',
                href: '/admin/themes',
                icon: Palette,
            },
            {
                title: 'Forms',
                href: '/admin/forms',
                icon: ClipboardList,
            },
            {
                title: 'FAQ',
                href: '/admin/faqs',
                icon: HelpCircle,
            },
            {
                title: 'Section Templates',
                href: '/admin/section-templates',
                icon: LibraryBig,
            },
            {
                title: 'Stores',
                href: '/admin/stores',
                icon: MapPin,
            },
            {
                title: 'Blog Posts',
                href: '/admin/blog/posts',
                icon: BookOpen,
            },
            {
                title: 'Blog Categories',
                href: '/admin/blog/categories',
                icon: FolderOpen,
            },
        ],
    },
    {
        title: 'Shop',
        icon: ShoppingBag,
        children: [
            {
                title: 'Products',
                href: '/admin/ecommerce/products',
                icon: Package,
            },
            {
                title: 'Categories',
                href: '/admin/ecommerce/categories',
                icon: List,
            },
            {
                title: 'Brands',
                href: '/admin/ecommerce/brands',
                icon: Tag,
            },
            {
                title: 'Product Types',
                href: '/admin/ecommerce/product-types',
                icon: Box,
            },
            {
                title: 'Attributes',
                href: '/admin/ecommerce/attributes',
                icon: List,
            },
            {
                title: 'Product Flags',
                href: '/admin/ecommerce/product-flags',
                icon: Flag,
            },
            {
                title: 'Orders',
                href: '/admin/ecommerce/orders',
                icon: ShoppingCart,
            },
            {
                title: 'Customers',
                href: '/admin/ecommerce/customers',
                icon: UserCircle,
            },
            {
                title: 'Discounts',
                href: '/admin/ecommerce/discounts',
                icon: Percent,
            },
            {
                title: 'Promotions',
                href: '/admin/ecommerce/promotions',
                icon: Tag,
            },
            {
                title: 'Tax Rates',
                href: '/admin/ecommerce/tax-rates',
                icon: Receipt,
            },
            {
                title: 'Shipping',
                href: '/admin/ecommerce/shipping-methods',
                icon: Truck,
            },
            {
                title: 'Returns',
                href: '/admin/ecommerce/returns',
                icon: RotateCcw,
            },
        ],
    },
    {
        title: 'Newsletter',
        icon: Mail,
        children: [
            {
                title: 'Subscribers',
                href: '/admin/newsletter/subscribers',
                icon: Users2,
            },
            {
                title: 'Segments',
                href: '/admin/newsletter/segments',
                icon: List,
            },
            {
                title: 'Campaigns',
                href: '/admin/newsletter/campaigns',
                icon: Megaphone,
            },
        ],
    },
    {
        title: 'Finance',
        icon: Coins,
        children: [
            {
                title: 'Currencies',
                href: '/admin/currencies',
                icon: Coins,
            },
            {
                title: 'Exchange Rates',
                href: '/admin/exchange-rates',
                icon: ArrowRightLeft,
            },
        ],
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Notifications',
        href: '/admin/notifications',
        icon: Bell,
    },
    {
        title: 'Activity Log',
        href: '/admin/activity-log',
        icon: Activity,
    },
    {
        title: 'Cookie Consents',
        href: '/admin/cookie-consents',
        icon: Cookie,
    },
    {
        title: 'i18n',
        icon: Languages,
        children: [
            {
                title: 'Locales',
                href: '/admin/locales',
                icon: Flag,
            },
            {
                title: 'Translations',
                href: '/admin/translations',
                icon: Languages,
            },
        ],
    },
    {
        title: 'Affiliates',
        icon: Link2,
        children: [
            {
                title: 'Codes',
                href: '/admin/affiliates/codes',
                icon: GitBranch,
            },
            {
                title: 'Referrals',
                href: '/admin/affiliates/referrals',
                icon: Users2,
            },
        ],
    },
    {
        title: 'Support',
        icon: MessageCircle,
        children: [
            {
                title: 'Conversations',
                href: '/admin/support',
                icon: MessageSquare,
            },
            {
                title: 'Canned Responses',
                href: '/admin/support/canned-responses',
                icon: ClipboardList,
            },
        ],
    },
    {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const page = usePage();
    const currentUrl = page.url;

    const isActive = (href: unknown): boolean => {
        if (!href || typeof href !== 'string') return false;
        return (
            currentUrl === href ||
            currentUrl.startsWith(href + '?') ||
            currentUrl.startsWith(href + '/')
        );
    };

    const isParentActive = (children?: unknown[]): boolean => {
        if (!children) return false;
        return children.some((child: unknown) =>
            isActive((child as { href: unknown }).href),
        );
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {baseNavItems.map((item) => {
                            if (item.children) {
                                const parentActive = isParentActive(
                                    item.children,
                                );
                                return (
                                    <Collapsible
                                        key={item.title}
                                        asChild
                                        defaultOpen={parentActive}
                                        className="group/collapsible"
                                    >
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger
                                                className="cursor-pointer"
                                                asChild
                                            >
                                                <SidebarMenuButton
                                                    tooltip={item.title}
                                                    isActive={parentActive}
                                                >
                                                    {item.icon && <item.icon />}
                                                    <span>{item.title}</span>
                                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.children.map(
                                                        (subItem) => (
                                                            <SidebarMenuSubItem
                                                                key={
                                                                    subItem.title
                                                                }
                                                            >
                                                                <SidebarMenuSubButton
                                                                    asChild
                                                                    isActive={isActive(
                                                                        subItem.href,
                                                                    )}
                                                                >
                                                                    <Link
                                                                        href={
                                                                            subItem.href
                                                                        }
                                                                    >
                                                                        {subItem.icon && (
                                                                            <subItem.icon />
                                                                        )}
                                                                        <span>
                                                                            {
                                                                                subItem.title
                                                                            }
                                                                        </span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ),
                                                    )}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                );
                            }

                            // Simple item without children
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        isActive={isActive(item.href)}
                                    >
                                        <Link href={item.href}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
