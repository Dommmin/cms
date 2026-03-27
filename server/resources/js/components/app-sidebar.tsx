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
import * as MediaController from '@/actions/App/Http/Controllers/Admin/MediaController';
import * as PageController from '@/actions/App/Http/Controllers/Admin/Cms/PageController';
import * as ReusableBlockController from '@/actions/App/Http/Controllers/Admin/Cms/ReusableBlockController';
import * as MenuController from '@/actions/App/Http/Controllers/Admin/MenuController';
import * as ThemeController from '@/actions/App/Http/Controllers/Admin/ThemeController';
import * as FormController from '@/actions/App/Http/Controllers/Admin/FormController';
import * as FaqController from '@/actions/App/Http/Controllers/Admin/FaqController';
import * as SectionTemplateController from '@/actions/App/Http/Controllers/Admin/SectionTemplateController';
import * as StoreController from '@/actions/App/Http/Controllers/Admin/StoreController';
import * as BlogPostController from '@/actions/App/Http/Controllers/Admin/BlogPostController';
import * as BlogCategoryController from '@/actions/App/Http/Controllers/Admin/BlogCategoryController';
import * as ProductController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductController';
import * as CategoryController from '@/actions/App/Http/Controllers/Admin/Ecommerce/CategoryController';
import * as BrandController from '@/actions/App/Http/Controllers/Admin/Ecommerce/BrandController';
import * as ProductTypeController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductTypeController';
import * as AttributeController from '@/actions/App/Http/Controllers/Admin/Ecommerce/AttributeController';
import * as ProductFlagController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductFlagController';
import * as OrderController from '@/actions/App/Http/Controllers/Admin/Ecommerce/OrderController';
import * as CustomerController from '@/actions/App/Http/Controllers/Admin/Ecommerce/CustomerController';
import * as DiscountController from '@/actions/App/Http/Controllers/Admin/Ecommerce/DiscountController';
import * as PromotionController from '@/actions/App/Http/Controllers/Admin/Ecommerce/PromotionController';
import * as TaxRateController from '@/actions/App/Http/Controllers/Admin/Ecommerce/TaxRateController';
import * as ShippingMethodController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ShippingMethodController';
import * as ReturnRequestController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ReturnRequestController';
import * as ReviewController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ReviewController';
import * as NewsletterSubscriberController from '@/actions/App/Http/Controllers/Admin/NewsletterSubscriberController';
import * as NewsletterSegmentController from '@/actions/App/Http/Controllers/Admin/NewsletterSegmentController';
import * as NewsletterCampaignController from '@/actions/App/Http/Controllers/Admin/NewsletterCampaignController';
import * as CurrencyController from '@/actions/App/Http/Controllers/Admin/CurrencyController';
import * as ExchangeRateController from '@/actions/App/Http/Controllers/Admin/ExchangeRateController';
import * as UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import * as AppNotificationController from '@/actions/App/Http/Controllers/Admin/AppNotificationController';
import * as ActivityLogController from '@/actions/App/Http/Controllers/Admin/ActivityLogController';
import * as CookieConsentController from '@/actions/App/Http/Controllers/Admin/CookieConsentController';
import * as LocaleController from '@/actions/App/Http/Controllers/Admin/LocaleController';
import * as TranslationController from '@/actions/App/Http/Controllers/Admin/TranslationController';
import * as AffiliateCodeController from '@/actions/App/Http/Controllers/Admin/AffiliateCodeController';
import * as ReferralController from '@/actions/App/Http/Controllers/Admin/ReferralController';
import * as SupportConversationController from '@/actions/App/Http/Controllers/Admin/SupportConversationController';
import * as SupportCannedResponseController from '@/actions/App/Http/Controllers/Admin/SupportCannedResponseController';
import * as SettingsController from '@/actions/App/Http/Controllers/Admin/SettingsController';
import * as DashboardWidgetController from '@/actions/App/Http/Controllers/Admin/DashboardWidgetController';

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
            href: MediaController.index.url(),
            icon: Image,
        },
        {
            title: __('nav.cms', 'CMS'),
            icon: Folder,
            children: [
                {
                    title: __('nav.pages', 'Pages'),
                    href: PageController.index.url(),
                    icon: LayoutGrid,
                },
                {
                    title: __('nav.global_blocks', 'Global Blocks'),
                    href: ReusableBlockController.index.url(),
                    icon: LibraryBig,
                },
                {
                    title: __('nav.menus', 'Menus'),
                    href: MenuController.index.url(),
                    icon: Menu,
                },
                {
                    title: __('nav.themes', 'Themes'),
                    href: ThemeController.index.url(),
                    icon: Palette,
                },
                {
                    title: __('nav.forms', 'Forms'),
                    href: FormController.index.url(),
                    icon: ClipboardList,
                },
                {
                    title: __('nav.faq', 'FAQ'),
                    href: FaqController.index.url(),
                    icon: HelpCircle,
                },
                {
                    title: __('nav.section_templates', 'Section Templates'),
                    href: SectionTemplateController.index.url(),
                    icon: LibraryBig,
                },
                {
                    title: __('nav.stores', 'Stores'),
                    href: StoreController.index.url(),
                    icon: MapPin,
                },
                {
                    title: __('nav.blog_posts', 'Blog Posts'),
                    href: BlogPostController.index.url(),
                    icon: BookOpen,
                },
                {
                    title: __('nav.blog_categories', 'Blog Categories'),
                    href: BlogCategoryController.index.url(),
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
                    href: ProductController.index.url(),
                    icon: Package,
                },
                {
                    title: __('nav.categories', 'Categories'),
                    href: CategoryController.index.url(),
                    icon: List,
                },
                {
                    title: __('nav.brands', 'Brands'),
                    href: BrandController.index.url(),
                    icon: Tag,
                },
                {
                    title: __('nav.product_types', 'Product Types'),
                    href: ProductTypeController.index.url(),
                    icon: Box,
                },
                {
                    title: __('nav.attributes', 'Attributes'),
                    href: AttributeController.index.url(),
                    icon: List,
                },
                {
                    title: __('nav.product_flags', 'Product Flags'),
                    href: ProductFlagController.index.url(),
                    icon: Flag,
                },
                {
                    title: __('nav.orders', 'Orders'),
                    href: OrderController.index.url(),
                    icon: ShoppingCart,
                },
                {
                    title: __('nav.customers', 'Customers'),
                    href: CustomerController.index.url(),
                    icon: UserCircle,
                },
                {
                    title: __('nav.discounts', 'Discounts'),
                    href: DiscountController.index.url(),
                    icon: Percent,
                },
                {
                    title: __('nav.promotions', 'Promotions'),
                    href: PromotionController.index.url(),
                    icon: Tag,
                },
                {
                    title: __('nav.tax_rates', 'Tax Rates'),
                    href: TaxRateController.index.url(),
                    icon: Receipt,
                },
                {
                    title: __('nav.shipping', 'Shipping'),
                    href: ShippingMethodController.index.url(),
                    icon: Truck,
                },
                {
                    title: __('nav.returns', 'Returns'),
                    href: ReturnRequestController.index.url(),
                    icon: RotateCcw,
                },
                {
                    title: __('nav.reviews', 'Reviews'),
                    href: ReviewController.index.url(),
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
                    href: NewsletterSubscriberController.index.url(),
                    icon: Users2,
                },
                {
                    title: __('nav.segments', 'Segments'),
                    href: NewsletterSegmentController.index.url(),
                    icon: List,
                },
                {
                    title: __('nav.campaigns', 'Campaigns'),
                    href: NewsletterCampaignController.index.url(),
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
                    href: CurrencyController.index.url(),
                    icon: Coins,
                },
                {
                    title: __('nav.exchange_rates', 'Exchange Rates'),
                    href: ExchangeRateController.index.url(),
                    icon: ArrowRightLeft,
                },
            ],
        },
        {
            title: __('nav.users', 'Users'),
            href: UserController.index.url(),
            icon: Users,
        },
        {
            title: __('nav.notifications', 'Notifications'),
            href: AppNotificationController.index.url(),
            icon: Bell,
        },
        {
            title: __('nav.activity_log', 'Activity Log'),
            href: ActivityLogController.index.url(),
            icon: Activity,
        },
        {
            title: __('nav.cookie_consents', 'Cookie Consents'),
            href: CookieConsentController.index.url(),
            icon: Cookie,
        },
        {
            title: __('nav.i18n', 'i18n'),
            icon: Languages,
            children: [
                {
                    title: __('nav.locales', 'Locales'),
                    href: LocaleController.index.url(),
                    icon: Flag,
                },
                {
                    title: __('nav.translations', 'Translations'),
                    href: TranslationController.index.url(),
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
                    href: AffiliateCodeController.index.url(),
                    icon: GitBranch,
                },
                {
                    title: __('nav.referrals', 'Referrals'),
                    href: ReferralController.index.url(),
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
                    href: SupportConversationController.index.url(),
                    icon: MessageSquare,
                },
                {
                    title: __('nav.canned_responses', 'Canned Responses'),
                    href: SupportCannedResponseController.index.url(),
                    icon: ClipboardList,
                },
            ],
        },
        {
            title: __('nav.settings', 'Settings'),
            href: SettingsController.index.url(),
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
                                                                        cacheFor={
                                                                            30
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
                                        <Link
                                            href={item.href}
                                            prefetch
                                            cacheFor={30}
                                        >
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
