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
    Star,
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

import { useTranslation } from '@/hooks/use-translation';
import { dashboard } from '@/routes/admin';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const __ = useTranslation();

    const baseNavItems: NavItem[] = [
    {
        title: __('nav.dashboard', 'Dashboard'),
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: __('nav.media', 'Media'),
        href: '/admin/media',
        icon: Image,
    },
    {
        title: __('nav.cms', 'CMS'),
        icon: Folder,
        children: [
            {
                title: __('nav.pages', 'Pages'),
                href: '/admin/cms/pages',
                icon: LayoutGrid,
            },
            {
                title: __('nav.global_blocks', 'Global Blocks'),
                href: '/admin/cms/reusable-blocks',
                icon: LibraryBig,
            },
            {
                title: __('nav.menus', 'Menus'),
                href: '/admin/menus',
                icon: Menu,
            },
            {
                title: __('nav.themes', 'Themes'),
                href: '/admin/themes',
                icon: Palette,
            },
            {
                title: __('nav.forms', 'Forms'),
                href: '/admin/forms',
                icon: ClipboardList,
            },
            {
                title: __('nav.faq', 'FAQ'),
                href: '/admin/faqs',
                icon: HelpCircle,
            },
            {
                title: __('nav.section_templates', 'Section Templates'),
                href: '/admin/section-templates',
                icon: LibraryBig,
            },
            {
                title: __('nav.stores', 'Stores'),
                href: '/admin/stores',
                icon: MapPin,
            },
            {
                title: __('nav.blog_posts', 'Blog Posts'),
                href: '/admin/blog/posts',
                icon: BookOpen,
            },
            {
                title: __('nav.blog_categories', 'Blog Categories'),
                href: '/admin/blog/categories',
                icon: FolderOpen,
            },
        ],
    },
    {
        title: __('nav.shop', 'Shop'),
        icon: ShoppingBag,
        children: [
            {
                title: __('nav.products', 'Products'),
                href: '/admin/ecommerce/products',
                icon: Package,
            },
            {
                title: __('nav.categories', 'Categories'),
                href: '/admin/ecommerce/categories',
                icon: List,
            },
            {
                title: __('nav.brands', 'Brands'),
                href: '/admin/ecommerce/brands',
                icon: Tag,
            },
            {
                title: __('nav.product_types', 'Product Types'),
                href: '/admin/ecommerce/product-types',
                icon: Box,
            },
            {
                title: __('nav.attributes', 'Attributes'),
                href: '/admin/ecommerce/attributes',
                icon: List,
            },
            {
                title: __('nav.product_flags', 'Product Flags'),
                href: '/admin/ecommerce/product-flags',
                icon: Flag,
            },
            {
                title: __('nav.orders', 'Orders'),
                href: '/admin/ecommerce/orders',
                icon: ShoppingCart,
            },
            {
                title: __('nav.customers', 'Customers'),
                href: '/admin/ecommerce/customers',
                icon: UserCircle,
            },
            {
                title: __('nav.discounts', 'Discounts'),
                href: '/admin/ecommerce/discounts',
                icon: Percent,
            },
            {
                title: __('nav.promotions', 'Promotions'),
                href: '/admin/ecommerce/promotions',
                icon: Tag,
            },
            {
                title: __('nav.tax_rates', 'Tax Rates'),
                href: '/admin/ecommerce/tax-rates',
                icon: Receipt,
            },
            {
                title: __('nav.shipping', 'Shipping'),
                href: '/admin/ecommerce/shipping-methods',
                icon: Truck,
            },
            {
                title: __('nav.returns', 'Returns'),
                href: '/admin/ecommerce/returns',
                icon: RotateCcw,
            },
            {
                title: __('nav.reviews', 'Reviews'),
                href: '/admin/ecommerce/reviews',
                icon: Star,
            },
        ],
    },
    {
        title: __('nav.newsletter', 'Newsletter'),
        icon: Mail,
        children: [
            {
                title: __('nav.subscribers', 'Subscribers'),
                href: '/admin/newsletter/subscribers',
                icon: Users2,
            },
            {
                title: __('nav.segments', 'Segments'),
                href: '/admin/newsletter/segments',
                icon: List,
            },
            {
                title: __('nav.campaigns', 'Campaigns'),
                href: '/admin/newsletter/campaigns',
                icon: Megaphone,
            },
        ],
    },
    {
        title: __('nav.finance', 'Finance'),
        icon: Coins,
        children: [
            {
                title: __('nav.currencies', 'Currencies'),
                href: '/admin/currencies',
                icon: Coins,
            },
            {
                title: __('nav.exchange_rates', 'Exchange Rates'),
                href: '/admin/exchange-rates',
                icon: ArrowRightLeft,
            },
        ],
    },
    {
        title: __('nav.users', 'Users'),
        href: '/admin/users',
        icon: Users,
    },
    {
        title: __('nav.notifications', 'Notifications'),
        href: '/admin/notifications',
        icon: Bell,
    },
    {
        title: __('nav.activity_log', 'Activity Log'),
        href: '/admin/activity-log',
        icon: Activity,
    },
    {
        title: __('nav.cookie_consents', 'Cookie Consents'),
        href: '/admin/cookie-consents',
        icon: Cookie,
    },
    {
        title: __('nav.i18n', 'i18n'),
        icon: Languages,
        children: [
            {
                title: __('nav.locales', 'Locales'),
                href: '/admin/locales',
                icon: Flag,
            },
            {
                title: __('nav.translations', 'Translations'),
                href: '/admin/translations',
                icon: Languages,
            },
        ],
    },
    {
        title: __('nav.affiliates', 'Affiliates'),
        icon: Link2,
        children: [
            {
                title: __('nav.affiliate_codes', 'Codes'),
                href: '/admin/affiliates/codes',
                icon: GitBranch,
            },
            {
                title: __('nav.referrals', 'Referrals'),
                href: '/admin/affiliates/referrals',
                icon: Users2,
            },
        ],
    },
    {
        title: __('nav.support', 'Support'),
        icon: MessageCircle,
        children: [
            {
                title: __('nav.conversations', 'Conversations'),
                href: '/admin/support',
                icon: MessageSquare,
            },
            {
                title: __('nav.canned_responses', 'Canned Responses'),
                href: '/admin/support/canned-responses',
                icon: ClipboardList,
            },
        ],
    },
    {
        title: __('nav.settings', 'Settings'),
        href: '/admin/settings',
        icon: Settings,
    },
];


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
                                                                        prefetch
                                                                        cacheFor={30}
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
                                        <Link href={item.href} prefetch cacheFor={30}>
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
