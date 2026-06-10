import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowRightLeft,
    BarChart2,
    Bell,
    BookOpen,
    Box,
    ChevronRight,
    ClipboardList,
    Coins,
    Cookie,
    Database,
    FileText,
    Flag,
    FolderOpen,
    GitBranch,
    Heart,
    HelpCircle,
    Image,
    Languages,
    Layout,
    LayoutGrid,
    LibraryBig,
    Link2,
    List,
    Mail,
    MapPin,
    Megaphone,
    Menu,
    MessageCircle,
    MessageSquare,
    Package,
    Palette,
    Percent,
    Receipt,
    RotateCcw,
    Search,
    Settings,
    Shield,
    ShoppingBag,
    ShoppingCart,
    Star,
    Tag,
    Truck,
    TrendingUp,
    UserCircle,
    Users,
    Users2,
    Webhook,
    Zap,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

import * as ActivityLogController from '@/actions/App/Http/Controllers/Admin/ActivityLogController';
import * as AffiliateCodeController from '@/actions/App/Http/Controllers/Admin/AffiliateCodeController';
import * as AnalyticsController from '@/actions/App/Http/Controllers/Admin/AnalyticsController';
import * as AppNotificationController from '@/actions/App/Http/Controllers/Admin/AppNotificationController';
import * as BlogCategoryController from '@/actions/App/Http/Controllers/Admin/BlogCategoryController';
import * as BlogPostController from '@/actions/App/Http/Controllers/Admin/BlogPostController';
import * as GlobalSlotController from '@/actions/App/Http/Controllers/Admin/Cms/GlobalSlotController';
import * as PageController from '@/actions/App/Http/Controllers/Admin/Cms/PageController';
import * as ReusableBlockController from '@/actions/App/Http/Controllers/Admin/Cms/ReusableBlockController';
import * as CookieConsentController from '@/actions/App/Http/Controllers/Admin/CookieConsentController';
import * as CurrencyController from '@/actions/App/Http/Controllers/Admin/CurrencyController';
import * as CustomReportController from '@/actions/App/Http/Controllers/Admin/CustomReportController';
import * as AttributeController from '@/actions/App/Http/Controllers/Admin/Ecommerce/AttributeController';
import * as BrandController from '@/actions/App/Http/Controllers/Admin/Ecommerce/BrandController';
import * as CartController from '@/actions/App/Http/Controllers/Admin/Ecommerce/CartController';
import * as CategoryController from '@/actions/App/Http/Controllers/Admin/Ecommerce/CategoryController';
import * as CustomerController from '@/actions/App/Http/Controllers/Admin/Ecommerce/CustomerController';
import * as DiscountController from '@/actions/App/Http/Controllers/Admin/Ecommerce/DiscountController';
import * as EmailTemplateController from '@/actions/App/Http/Controllers/Admin/Ecommerce/EmailTemplateController';
import * as OrderController from '@/actions/App/Http/Controllers/Admin/Ecommerce/OrderController';
import * as ProductController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductController';
import * as ProductFlagController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductFlagController';
import * as ProductTypeController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ProductTypeController';
import * as PromotionController from '@/actions/App/Http/Controllers/Admin/Ecommerce/PromotionController';
import * as ReturnRequestController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ReturnRequestController';
import * as ReviewController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ReviewController';
import * as ShippingMethodController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ShippingMethodController';
import * as TaxRateController from '@/actions/App/Http/Controllers/Admin/Ecommerce/TaxRateController';
import * as WishlistController from '@/actions/App/Http/Controllers/Admin/Ecommerce/WishlistController';
import * as ExchangeRateController from '@/actions/App/Http/Controllers/Admin/ExchangeRateController';
import * as FaqController from '@/actions/App/Http/Controllers/Admin/FaqController';
import * as FormController from '@/actions/App/Http/Controllers/Admin/FormController';
import * as LocaleController from '@/actions/App/Http/Controllers/Admin/LocaleController';
import * as AutomationController from '@/actions/App/Http/Controllers/Admin/Marketing/AutomationController';
import * as MediaController from '@/actions/App/Http/Controllers/Admin/MediaController';
import * as MenuController from '@/actions/App/Http/Controllers/Admin/MenuController';
import * as MetafieldDefinitionController from '@/actions/App/Http/Controllers/Admin/MetafieldDefinitionController';
import * as NewsletterCampaignController from '@/actions/App/Http/Controllers/Admin/NewsletterCampaignController';
import * as NewsletterSegmentController from '@/actions/App/Http/Controllers/Admin/NewsletterSegmentController';
import * as NewsletterSubscriberController from '@/actions/App/Http/Controllers/Admin/NewsletterSubscriberController';
import * as PrivacyRequestController from '@/actions/App/Http/Controllers/Admin/PrivacyRequestController';
import * as ReferralController from '@/actions/App/Http/Controllers/Admin/ReferralController';
import * as RoleController from '@/actions/App/Http/Controllers/Admin/RoleController';
import * as SearchAnalyticsController from '@/actions/App/Http/Controllers/Admin/SearchAnalyticsController';
import * as SearchSynonymController from '@/actions/App/Http/Controllers/Admin/SearchSynonymController';
import * as SettingsController from '@/actions/App/Http/Controllers/Admin/SettingsController';
import * as StoreController from '@/actions/App/Http/Controllers/Admin/StoreController';
import * as SupportCannedResponseController from '@/actions/App/Http/Controllers/Admin/SupportCannedResponseController';
import * as SupportConversationController from '@/actions/App/Http/Controllers/Admin/SupportConversationController';
import * as ThemeController from '@/actions/App/Http/Controllers/Admin/ThemeController';
import * as TranslationController from '@/actions/App/Http/Controllers/Admin/TranslationController';
import * as UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import * as WebhookController from '@/actions/App/Http/Controllers/Admin/WebhookController';
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
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';

import { useTranslation } from '@/hooks/use-translation';
import { dashboard } from '@/routes/admin';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const __ = useTranslation();
    const { modules } = usePage().props;
    const sidebarContentRef = useRef<HTMLDivElement | null>(null);

    const contentNavItems: NavItem[] = [
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
            title: __('nav.global_slots', 'Global Slots'),
            href: GlobalSlotController.index.url(),
            icon: Layout,
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
            title: __('nav.media', 'Media'),
            href: MediaController.index.url(),
            icon: Image,
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
            title: __('nav.stores', 'Stores'),
            href: StoreController.index.url(),
            icon: MapPin,
        },
        ...(modules?.blog
            ? [
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
              ]
            : []),
    ];

    const shopNavItems: NavItem[] = modules?.ecommerce
        ? [
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
                  title: __('nav.returns_complaints', 'Returns & Complaints'),
                  href: ReturnRequestController.index.url(),
                  icon: RotateCcw,
              },
              {
                  title: __('nav.reviews', 'Reviews'),
                  href: ReviewController.index.url(),
                  icon: Star,
              },
              {
                  title: __('nav.carts', 'Carts'),
                  href: CartController.index.url(),
                  icon: ShoppingBag,
              },
              {
                  title: __('nav.wishlists', 'Wishlists'),
                  href: WishlistController.index.url(),
                  icon: Heart,
              },
          ]
        : [];

    const marketingNavItems: NavItem[] = [
        ...(modules?.newsletter
            ? [
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
              ]
            : []),
        ...(modules?.marketing
            ? [
                  {
                      title: __('nav.automations', 'Automations'),
                      href: AutomationController.index.url(),
                      icon: Zap,
                  },
                  {
                      title: __('nav.email_templates', 'Email Templates'),
                      href: EmailTemplateController.index.url(),
                      icon: FileText,
                  },
              ]
            : []),
        ...(modules?.ecommerce && modules?.marketing
            ? [
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
              ]
            : []),
    ];

    const analyticsNavItems: NavItem[] = [
        ...(modules?.ecommerce
            ? [
                  {
                      title: __('nav.sales', 'Sales'),
                      href: AnalyticsController.conversion.url(),
                      icon: TrendingUp,
                  },
                  {
                      title: __('nav.customers_analytics', 'Customers'),
                      href: AnalyticsController.customers.url(),
                      icon: Users,
                  },
                  {
                      title: __('nav.inventory', 'Inventory'),
                      href: AnalyticsController.inventory.url(),
                      icon: Package,
                  },
                  {
                      title: __('nav.vat', 'VAT / JPK'),
                      href: AnalyticsController.vat.url(),
                      icon: Receipt,
                  },
              ]
            : []),
        {
            title: __('nav.custom_reports', 'Custom Reports'),
            href: CustomReportController.index.url(),
            icon: BarChart2,
        },
        {
            title: __('nav.search_analytics', 'Search Analytics'),
            href: SearchAnalyticsController.index.url(),
            icon: Search,
        },
    ];

    const systemNavItems: NavItem[] = [
        {
            title: __('nav.users', 'Users'),
            href: UserController.index.url(),
            icon: Users,
        },
        {
            title: __('nav.roles', 'Roles'),
            href: RoleController.index.url(),
            icon: Shield,
        },
        {
            title: __('nav.metafield_definitions', 'Metafields'),
            href: MetafieldDefinitionController.index.url(),
            icon: Database,
        },
        ...(modules?.ecommerce
            ? [
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
              ]
            : []),
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
            title: __('nav.search_synonyms', 'Search Synonyms'),
            href: SearchSynonymController.index.url(),
            icon: Search,
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
            title: __('nav.webhooks', 'Webhooks'),
            href: WebhookController.index.url(),
            icon: Webhook,
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
            title: __('nav.privacy_requests', 'Privacy Requests'),
            href: PrivacyRequestController.index.url(),
            icon: Shield,
        },
        {
            title: __('nav.settings', 'Settings'),
            href: SettingsController.index.url(),
            icon: Settings,
        },
    ];

    const page = usePage();
    const currentUrl = page.url;

    useEffect(() => {
        const sidebarContent = sidebarContentRef.current;

        if (!sidebarContent) {
            return;
        }

        const activeElement = sidebarContent.querySelector<HTMLElement>(
            '[data-sidebar="menu-sub-button"][data-active="true"], [data-sidebar="menu-button"][data-active="true"]',
        );

        if (!activeElement) {
            return;
        }

        const frame = window.requestAnimationFrame(() => {
            activeElement.scrollIntoView({
                block: 'center',
                inline: 'nearest',
            });
        });

        return () => window.cancelAnimationFrame(frame);
    }, [currentUrl]);

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

    const renderNavItem = (item: NavItem) => {
        if (item.children) {
            const parentActive = isParentActive(item.children);
            return (
                <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={parentActive}
                    className="group/collapsible"
                >
                    <SidebarMenuItem>
                        <CollapsibleTrigger className="cursor-pointer" asChild>
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
                                {item.children.map((subItem) => (
                                    <SidebarMenuSubItem key={subItem.title}>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={isActive(subItem.href)}
                                        >
                                            <Link
                                                href={subItem.href}
                                                prefetch
                                                cacheFor={30}
                                            >
                                                {subItem.icon && (
                                                    <subItem.icon />
                                                )}
                                                <span>{subItem.title}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            );
        }

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

            <SidebarContent ref={sidebarContentRef}>
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip={__('nav.dashboard', 'Dashboard')}
                                isActive={isActive(dashboard())}
                            >
                                <Link href={dashboard()} prefetch cacheFor={30}>
                                    <LayoutGrid />
                                    <span>
                                        {__('nav.dashboard', 'Dashboard')}
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>
                        {__('nav.group_content', 'Content')}
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {contentNavItems.map(renderNavItem)}
                    </SidebarMenu>
                </SidebarGroup>

                {shopNavItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>
                            {__('nav.group_shop', 'Shop')}
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {shopNavItems.map(renderNavItem)}
                        </SidebarMenu>
                    </SidebarGroup>
                )}

                {marketingNavItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>
                            {__('nav.group_marketing', 'Marketing')}
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {marketingNavItems.map(renderNavItem)}
                        </SidebarMenu>
                    </SidebarGroup>
                )}

                <SidebarGroup>
                    <SidebarGroupLabel>
                        {__('nav.group_analytics', 'Analytics')}
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {analyticsNavItems.map(renderNavItem)}
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>
                        {__('nav.group_system', 'System')}
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {systemNavItems.map(renderNavItem)}
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
