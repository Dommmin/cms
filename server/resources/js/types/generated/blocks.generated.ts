/**
 * AUTO-GENERATED FILE — DO NOT EDIT MANUALLY.
 *
 * Contract: blocks.schema.json (server snapshot)
 * Regenerate: docker compose exec php npm run generate:blocks-types
 */

export type BlockType =
    | 'accordion'
    | 'alert_banner'
    | 'brands_slider'
    | 'call_to_action'
    | 'categories_grid'
    | 'countdown_timer'
    | 'custom_html'
    | 'featured_posts'
    | 'featured_products'
    | 'form_embed'
    | 'hero_banner'
    | 'icon_list'
    | 'image_gallery'
    | 'logo_cloud'
    | 'map'
    | 'newsletter_signup'
    | 'pricing_cards'
    | 'pricing_table'
    | 'promotional_banner'
    | 'rich_text'
    | 'stats_counter'
    | 'steps_process'
    | 'tabs'
    | 'team_members'
    | 'testimonials'
    | 'three_columns'
    | 'timeline'
    | 'trust_badges'
    | 'two_columns'
    | 'video_embed';

export type BlockDataStrategy =
    | 'cached'
    | 'client'
    | 'hybrid'
    | 'none'
    | 'server';

export type BlockDefinitionExport = {
    accordion: {
        type: 'accordion';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    alert_banner: {
        type: 'alert_banner';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    brands_slider: {
        type: 'brands_slider';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    call_to_action: {
        type: 'call_to_action';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    categories_grid: {
        type: 'categories_grid';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    countdown_timer: {
        type: 'countdown_timer';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    custom_html: {
        type: 'custom_html';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    featured_posts: {
        type: 'featured_posts';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    featured_products: {
        type: 'featured_products';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    form_embed: {
        type: 'form_embed';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    hero_banner: {
        type: 'hero_banner';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    icon_list: {
        type: 'icon_list';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    image_gallery: {
        type: 'image_gallery';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    logo_cloud: {
        type: 'logo_cloud';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    map: {
        type: 'map';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    newsletter_signup: {
        type: 'newsletter_signup';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    pricing_cards: {
        type: 'pricing_cards';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    pricing_table: {
        type: 'pricing_table';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    promotional_banner: {
        type: 'promotional_banner';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    rich_text: {
        type: 'rich_text';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    stats_counter: {
        type: 'stats_counter';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    steps_process: {
        type: 'steps_process';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    tabs: {
        type: 'tabs';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    team_members: {
        type: 'team_members';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    testimonials: {
        type: 'testimonials';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    three_columns: {
        type: 'three_columns';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: [
            'rich_text',
            'image_gallery',
            'trust_badges',
            'icon_list',
            'call_to_action',
        ];
    };
    timeline: {
        type: 'timeline';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    trust_badges: {
        type: 'trust_badges';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
    two_columns: {
        type: 'two_columns';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: [
            'rich_text',
            'image_gallery',
            'trust_badges',
            'icon_list',
            'call_to_action',
        ];
    };
    video_embed: {
        type: 'video_embed';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: null;
    };
};

export type AccordionBlockConfigurationItemsItem = {
    title?: string;
    content?: string;
};

export type IconListBlockConfigurationItemsItem = {
    icon?: string;
    title?: string;
    description?: string;
};

export type PricingTableBlockConfigurationPlansItem = {
    name?: string;
    badge?: string;
    price_monthly?: string;
    price_yearly?: string;
    description?: string;
    features?: string;
    cta_label?: string;
    cta_url?: string;
    is_featured?: boolean;
};

export type StatsCounterBlockConfigurationStatsItem = {
    value?: string;
    suffix?: string;
    label?: string;
    icon?: string;
};

export type StepsProcessBlockConfigurationStepsItem = {
    title?: string;
    description?: string;
    icon?: string;
};

export type TabsBlockConfigurationTabsItem = {
    title?: string;
    content?: string;
};

export type TeamMembersBlockConfigurationMembersItem = {
    name?: string;
    role?: string;
    bio?: string;
    photo_url?: string;
    linkedin_url?: string;
    twitter_url?: string;
};

export type TestimonialsBlockConfigurationItemsItem = {
    author?: string;
    role?: string;
    content?: string;
    rating?: number;
};

export type TimelineBlockConfigurationItemsItem = {
    date?: string;
    title?: string;
    description?: string;
    icon?: string;
};

export type TrustBadgesBlockConfigurationBadgesItem = {
    icon?: string;
    label?: string;
    sublabel?: string;
};

export type AccordionBlockConfiguration = {
    title?: string;
    allow_multiple_open?: boolean;
    items?: AccordionBlockConfigurationItemsItem[];
};

export type AlertBannerBlockConfiguration = {
    message: string;
    link?: string;
    link_label?: string;
    variant?: 'info' | 'warning' | 'success' | 'error';
    dismissable?: boolean;
};

export type BrandsSliderBlockConfiguration = {
    title?: string;
    source?: 'all' | 'manual';
    speed?: 'slow' | 'normal' | 'fast';
    logo_height?: number;
    grayscale?: boolean;
};

export type CallToActionBlockConfiguration = {
    title?: string;
    subtitle?: string;
    alignment?: 'left' | 'center' | 'right';
    style?: 'plain' | 'gradient' | 'dark' | 'brand' | 'image';
    primary_label?: string;
    primary_url?: string;
    secondary_label?: string;
    secondary_url?: string;
    badge_text?: string;
};

export type CategoriesGridBlockConfiguration = {
    title?: string;
    columns?: number;
    show_labels?: boolean;
    style?: 'square' | 'circle' | 'wide';
};

export type CountdownTimerBlockConfiguration = {
    title?: string;
    subtitle?: string;
    target_date?: string;
    show_labels?: boolean;
    expired_message?: string;
    cta_label?: string;
    cta_url?: string;
    style?: 'light' | 'dark' | 'brand';
};

export type CustomHtmlBlockConfiguration = {
    html?: string;
    css?: string;
};

export type FeaturedPostsBlockConfiguration = {
    title?: string;
    subtitle?: string;
    source?: 'manual' | 'latest' | 'category';
    max_items?: number;
    columns?: number;
    display_mode?: 'grid' | 'list' | 'carousel';
    show_excerpt?: boolean;
    show_author?: boolean;
    show_date?: boolean;
    show_category?: boolean;
    show_read_time?: boolean;
    cta_text?: string;
    cta_url?: string;
};

export type FeaturedProductsBlockConfiguration = {
    filter_mode?: 'manual' | 'featured';
    title?: string;
    display_mode?: 'grid' | 'carousel' | 'list';
    items_per_row?: number;
    max_items?: number;
    show_price?: boolean;
    show_add_to_cart?: boolean;
    show_badges?: boolean;
};

export type FormEmbedBlockConfiguration = {
    title?: string;
    description?: string;
    success_redirect_url?: string;
};

export type HeroBannerBlockConfiguration = {
    title?: string;
    subtitle?: string;
    cta_text?: string;
    cta_url?: string;
    cta_style?: 'primary' | 'secondary' | 'outline' | 'ghost';
    cta2_text?: string;
    cta2_url?: string;
    cta2_style?: 'primary' | 'secondary' | 'outline' | 'ghost';
    text_alignment?: 'left' | 'center' | 'right';
    overlay_opacity?: number;
    min_height?: number;
};

export type IconListBlockConfiguration = {
    title?: string;
    subtitle?: string;
    columns?: number;
    style?: 'horizontal' | 'centered' | 'compact';
    icon_color?: string;
    items?: IconListBlockConfigurationItemsItem[];
};

export type ImageGalleryBlockConfiguration = {
    title?: string;
    layout?: 'grid' | 'masonry' | 'carousel';
    columns?: number;
    enable_lightbox?: boolean;
    show_captions?: boolean;
};

export type LogoCloudBlockConfiguration = {
    title?: string;
    columns?: number;
    logo_height?: number;
    grayscale?: boolean;
};

export type MapBlockConfiguration = {
    store_id?: number;
    lat?: number;
    lng?: number;
    title?: string;
    zoom?: number;
    height?: number;
};

export type NewsletterSignupBlockConfiguration = {
    title?: string;
    description?: string;
    button_text?: string;
    placeholder_text?: string;
    success_message?: string;
    background_color?: string;
};

export type PricingCardsBlockConfiguration = {
    title?: string;
    subtitle?: string;
    show_toggle?: boolean;
};

export type PricingTableBlockConfiguration = {
    title?: string;
    subtitle?: string;
    currency_symbol?: string;
    billing_toggle?: boolean;
    plans?: PricingTableBlockConfigurationPlansItem[];
};

export type PromotionalBannerBlockConfiguration = {
    title?: string;
    subtitle?: string;
    badge_text?: string;
    link_text?: string;
    link_url?: string;
    background_color?: string;
    text_color?: string;
};

export type RichTextBlockConfiguration = {
    content?: string;
    max_width?: 'narrow' | 'medium' | 'wide' | 'full';
};

export type StatsCounterBlockConfiguration = {
    title?: string;
    subtitle?: string;
    style?: 'plain' | 'card' | 'bordered' | 'icon';
    columns?: number;
    animate_numbers?: boolean;
    stats?: StatsCounterBlockConfigurationStatsItem[];
};

export type StepsProcessBlockConfiguration = {
    title?: string;
    subtitle?: string;
    layout?: 'horizontal' | 'vertical' | 'numbered';
    steps?: StepsProcessBlockConfigurationStepsItem[];
};

export type TabsBlockConfiguration = {
    tabs?: TabsBlockConfigurationTabsItem[];
};

export type TeamMembersBlockConfiguration = {
    title?: string;
    subtitle?: string;
    columns?: number;
    members?: TeamMembersBlockConfigurationMembersItem[];
};

export type TestimonialsBlockConfiguration = {
    title?: string;
    display_mode?: 'grid' | 'carousel' | 'single';
    show_rating?: boolean;
    items?: TestimonialsBlockConfigurationItemsItem[];
};

export type ThreeColumnsBlockConfiguration = {
    column_1_title?: string;
    column_1_content?: string;
    column_2_title?: string;
    column_2_content?: string;
    column_3_title?: string;
    column_3_content?: string;
    vertical_alignment?: 'top' | 'middle' | 'bottom';
};

export type TimelineBlockConfiguration = {
    title?: string;
    subtitle?: string;
    layout?: 'left' | 'center' | 'right';
    items?: TimelineBlockConfigurationItemsItem[];
};

export type TrustBadgesBlockConfiguration = {
    style?: 'row' | 'card' | 'minimal';
    badges?: TrustBadgesBlockConfigurationBadgesItem[];
};

export type TwoColumnsBlockConfiguration = {
    left_content?: string;
    right_content?: string;
    ratio?: '50-50' | '60-40' | '40-60' | '70-30' | '30-70';
    vertical_alignment?: 'top' | 'middle' | 'bottom';
    reverse_on_mobile?: boolean;
};

export type VideoEmbedBlockConfiguration = {
    title?: string;
    video_url?: string;
    autoplay?: boolean;
    loop?: boolean;
    show_controls?: boolean;
    aspect_ratio?: '16:9' | '4:3' | '1:1' | '9:16';
};

export type BlockConfigurationByType = {
    accordion: AccordionBlockConfiguration;
    alert_banner: AlertBannerBlockConfiguration;
    brands_slider: BrandsSliderBlockConfiguration;
    call_to_action: CallToActionBlockConfiguration;
    categories_grid: CategoriesGridBlockConfiguration;
    countdown_timer: CountdownTimerBlockConfiguration;
    custom_html: CustomHtmlBlockConfiguration;
    featured_posts: FeaturedPostsBlockConfiguration;
    featured_products: FeaturedProductsBlockConfiguration;
    form_embed: FormEmbedBlockConfiguration;
    hero_banner: HeroBannerBlockConfiguration;
    icon_list: IconListBlockConfiguration;
    image_gallery: ImageGalleryBlockConfiguration;
    logo_cloud: LogoCloudBlockConfiguration;
    map: MapBlockConfiguration;
    newsletter_signup: NewsletterSignupBlockConfiguration;
    pricing_cards: PricingCardsBlockConfiguration;
    pricing_table: PricingTableBlockConfiguration;
    promotional_banner: PromotionalBannerBlockConfiguration;
    rich_text: RichTextBlockConfiguration;
    stats_counter: StatsCounterBlockConfiguration;
    steps_process: StepsProcessBlockConfiguration;
    tabs: TabsBlockConfiguration;
    team_members: TeamMembersBlockConfiguration;
    testimonials: TestimonialsBlockConfiguration;
    three_columns: ThreeColumnsBlockConfiguration;
    timeline: TimelineBlockConfiguration;
    trust_badges: TrustBadgesBlockConfiguration;
    two_columns: TwoColumnsBlockConfiguration;
    video_embed: VideoEmbedBlockConfiguration;
};

export type BlockConfiguration<T extends BlockType> =
    BlockConfigurationByType[T];
