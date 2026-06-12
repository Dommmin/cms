// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        per_page: number;
        to: number | null;
        total: number;
        available_filters?: ProductAvailableFilters;
    };
}

export interface ProductFilterValue {
    slug: string;
    label: string;
    count: number;
}

export interface ProductBrandFilterValue {
    id: number;
    slug: string;
    label: string;
    count: number;
}

export interface ProductAttributeFilter {
    slug: string;
    label: string;
    values: ProductFilterValue[];
}

export interface ProductAvailableFilters {
    brands: ProductBrandFilterValue[];
    attributes: ProductAttributeFilter[];
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    two_factor_confirmed_at: string | null;
    created_at: string;
    processing_restricted_at: string | null;
}

export interface ConsentPreferences {
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
    consent_version: string | null;
    policy_version_snapshot?: {
        privacy_policy?: string | null;
        cookie_policy?: string | null;
    } | null;
}

export interface AuthResponse {
    token?: string;
    user?: User;
    two_factor_challenge?: boolean;
    challenge_token?: string;
}

export interface LoginPayload {
    email: string;
    password: string;
    cart_token?: string | null;
    wishlist_token?: string | null;
    cf_turnstile_response?: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    cart_token?: string | null;
    wishlist_token?: string | null;
    cf_turnstile_response?: string;
}

// ── Media ─────────────────────────────────────────────────────────────────────

export interface MediaItem {
    id: number;
    url: string;
    thumb_url?: string | null;
    alt: string | null;
    caption?: string | null;
    mime_type?: string;
    size?: number;
}

// ── Products ──────────────────────────────────────────────────────────────────

export interface ProductImage {
    id: number;
    url: string;
    thumb_url: string | null;
    alt: string | null;
    position: number;
}

export interface AttributeValue {
    id: number;
    value: string;
    label: string;
}

export interface Attribute {
    id: number;
    name: string;
    slug: string;
    values: AttributeValue[];
}

export interface ProductAttributeValue {
    attribute_id: number;
    slug: string;
    label: string;
    type: string;
    unit: string | null;
    is_required: boolean;
    value: string | number | boolean | null | Array<string> | Array<number>;
    display_value: string | number | boolean | null | Array<string>;
}

export interface ProductVariant {
    id: number;
    sku: string;
    /** price in cents */
    price: number;
    /** compare-at price in cents */
    compare_at_price: number | null;
    /** lowest price in last 30 days (Omnibus Directive), in cents */
    omnibus_price: number | null;
    stock_quantity: number;
    is_available: boolean;
    backorder_allowed?: boolean;
    attributes: Record<string, string>;
    tax_rate?: number | null;
}

export interface Brand {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    logo_url: string | null;
    public_url?: string | null;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    public_url?: string | null;
    short_description: string | null;
    description: string | null;
    /** min price across variants, in cents */
    price_min: number;
    /** max price across variants, in cents */
    price_max: number;
    is_active: boolean;
    is_featured: boolean;
    is_on_sale: boolean;
    discount_percentage?: number | null;
    /** lowest compare_at_price among on-sale variants, in cents */
    compare_at_price_min: number | null;
    /** lowest price in last 30 days for the cheapest on-sale variant (EU Omnibus), in cents */
    omnibus_price_min: number | null;
    thumbnail: ProductImage | null;
    images: ProductImage[];
    variants: ProductVariant[];
    category: Category | null;
    brand: Brand | null;
    attributes: Attribute[];
    attribute_values?: ProductAttributeValue[];
    attribute_summary?: Record<string, { label: string; value: string }>;
    /** Aggregated attribute values per key, present only in compare endpoint response */
    attribute_map?: Record<string, string[]>;
    /** Active promotions attached to this product (when loaded) */
    active_promotions?: Array<{ id: number; name: string; type: string }>;
    product_type_id?: number | null;
    created_at: string;
    seo_title: string | null;
    seo_description: string | null;
    meta_description: string | null;
    meta_robots: string;
    og_image: string | null;
    sitemap_exclude: boolean;
}

// ── Categories ────────────────────────────────────────────────────────────────

export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    parent_id: number | null;
    public_url?: string | null;
    children?: Category[];
    seo_title?: string | null;
    seo_description?: string | null;
    canonical_url?: string | null;
    meta_robots?: string;
    og_image?: string | null;
    sitemap_exclude?: boolean;
}

export interface CategoryShowResponse {
    category: Category;
    breadcrumb: Category[];
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export interface CartItem {
    id: number;
    variant_id: number;
    product: Pick<Product, 'id' | 'name' | 'slug' | 'thumbnail'>;
    variant: ProductVariant;
    quantity: number;
    /** unit price in cents */
    unit_price: number;
    /** subtotal in cents */
    subtotal: number;
}

export interface Cart {
    id: number;
    token: string | null;
    items: CartItem[];
    /** in cents */
    subtotal: number;
    /** in cents */
    discount_amount: number;
    /** in cents */
    total: number;
    discount_code: string | null;
    currency: string;
    items_count: number;
}

export type SharedCartPreviewItemStatus =
    | 'available'
    | 'partial'
    | 'unavailable';

export interface SharedCartPreviewItem {
    variant_id: number;
    requested_quantity: number;
    import_quantity: number;
    available_quantity: number;
    status: SharedCartPreviewItemStatus;
    status_message: string;
    shared_unit_price: number;
    current_unit_price: number;
    product: {
        name: string;
        slug: string | null;
        thumbnail: Product['thumbnail'] | null;
    };
    variant: {
        name: string | null;
        sku: string | null;
    };
}

export interface SharedCartPreview {
    token: string;
    currency: string;
    locale: string | null;
    discount_code: string | null;
    expires_at: string | null;
    is_active: boolean;
    items_count: number;
    shared_subtotal: number;
    estimated_subtotal: number;
    available_items: number;
    partial_items: number;
    unavailable_items: number;
    items: SharedCartPreviewItem[];
}

export interface SharedCartShareLink {
    token: string;
    expires_at: string | null;
}

export type SharedCartImportMode = 'merge' | 'replace';

export interface SharedCartImportResult {
    mode: SharedCartImportMode;
    added_items: number;
    merged_items: number;
    skipped_items: number;
    partial_items: number;
    imported_quantity: number;
    discount_cleared: boolean;
    message: string;
    cart: Cart;
}

// ── Addresses ─────────────────────────────────────────────────────────────────

export interface Address {
    id: number;
    type: 'billing' | 'shipping';
    first_name: string;
    last_name: string;
    company_name: string | null;
    street: string;
    street2: string | null;
    city: string;
    postal_code: string;
    country_code: string;
    phone: string | null;
    is_default: boolean;
    full_address?: string;
}

// ── Orders ────────────────────────────────────────────────────────────────────

export type OrderStatus =
    | 'draft'
    | 'pending'
    | 'awaiting_payment'
    | 'paid'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

export interface OrderItem {
    id: number;
    product_name: string;
    variant_sku: string;
    quantity: number;
    /** in cents */
    unit_price: number;
    /** in cents */
    subtotal: number;
    return_eligibility?: {
        order_item_id: number;
        ordered_quantity: number;
        already_requested_quantity: number;
        eligible_quantity: number;
        is_eligible: boolean;
        reasons: string[];
    };
}

export interface Shipment {
    id: number;
    carrier: string;
    tracking_number: string | null;
    tracking_url: string | null;
    status: string;
    shipped_at: string | null;
}

export interface Payment {
    /** Payment provider (p24, payu, paynow, cash_on_delivery, …) */
    provider?: string;
    /** Kept for backward compatibility */
    method?: string;
    payment_method?: string | null;
    status: string;
    amount: number;
    redirect_url?: string | null;
}

export interface OrderStatusHistory {
    status: string;
    note: string | null;
    created_at: string;
}

export interface OrderReturnItem {
    order_item_id?: number;
    quantity: number;
    condition: string | null;
    product_name: string | null;
    notes?: string | null;
}

export interface ReturnStatusHistory {
    previous_status: string | null;
    new_status: string;
    changed_by: string | null;
    notes: string | null;
    changed_at: string | null;
}

export interface OrderReturn {
    id: number;
    reference_number: string;
    return_type: string;
    status: string;
    order_reference_number?: string | null;
    reason: string | null;
    customer_notes: string | null;
    admin_notes: string | null;
    /** refund amount in cents */
    refund_amount: number | null;
    return_tracking_number: string | null;
    created_at: string;
    status_history?: ReturnStatusHistory[];
    items: OrderReturnItem[];
}

export interface Order {
    id: number;
    reference_number: string;
    status: OrderStatus;
    status_label?: string;
    /** in cents */
    subtotal: number;
    /** in cents */
    shipping_cost: number;
    /** in cents */
    discount_amount: number;
    /** in cents */
    tax_amount: number;
    /** in cents */
    total: number;
    currency_code: string;
    notes?: string | null;
    items: OrderItem[];
    shipment?: Shipment;
    payment?: Payment;
    shipping_address?: Address;
    billing_address?: Address;
    status_history?: OrderStatusHistory[];
    returns?: OrderReturn[];
    return_eligibility?: {
        delivered_at: string | null;
        eligible_types: Array<'return' | 'exchange' | 'complaint'>;
        blocked_reasons: string[];
        policy: {
            return_window_days: number;
            exchange_window_days: number;
            complaint_window_days: number;
        };
        items: Array<NonNullable<OrderItem['return_eligibility']>>;
    };
    created_at: string;
}

export interface GuestOrderTrackingResult {
    reference_number: string;
    status: OrderStatus;
    created_at: string;
    subtotal: number;
    shipping_cost: number;
    discount_amount: number;
    total: number;
    currency_code: string;
    items: Array<{
        id: number;
        product_name: string;
        variant_sku: string;
        quantity: number;
        unit_price: number;
    }>;
    payment: {
        provider: string;
        status: string;
        amount: number;
    } | null;
    shipment: {
        carrier: string;
        tracking_number: string | null;
        tracking_url: string | null;
        status: string;
        shipped_at: string | null;
    } | null;
    status_history: Array<{
        new_status: string;
        notes: string | null;
        changed_at: string;
    }>;
}

// ── Shipping ──────────────────────────────────────────────────────────────────

export interface ShippingMethod {
    id: number;
    name: string;
    description: string | null;
    carrier: string | null;
    /** price in cents */
    base_price: number;
    free_shipping_threshold: number | null;
    estimated_days_min: number | null;
    estimated_days_max: number | null;
    requires_pickup_point: boolean;
    /** true = InPost native geowidget, false = unified Leaflet picker */
    uses_native_widget: boolean;
}

export interface PickupPoint {
    id: string;
    name: string;
    address: string;
    hours: string | null;
    lat: number;
    lng: number;
}

// ── Wishlist ──────────────────────────────────────────────────────────────────

export interface WishlistItem {
    id: number;
    variant_id: number;
    product: Pick<Product, 'id' | 'name' | 'slug' | 'thumbnail' | 'price_min'>;
    variant: Pick<ProductVariant, 'id' | 'sku' | 'price' | 'attributes'> & {
        compare_at_price: number | null;
        omnibus_price: number | null;
        is_on_sale: boolean;
        in_stock: boolean;
    };
    added_at: string;
}

export interface Wishlist {
    id: number;
    token: string | null;
    items: WishlistItem[];
    items_count: number;
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ProductReview {
    id: number;
    rating: number;
    title: string | null;
    body: string;
    author: string;
    is_verified_purchase: boolean;
    helpful_count: number;
    status: ReviewStatus;
    created_at: string;
}

// ── Profile ───────────────────────────────────────────────────────────────────

export interface UpdateProfilePayload {
    name: string;
    email: string;
}

export interface UpdatePasswordPayload {
    current_password: string;
    password: string;
    password_confirmation: string;
}

// ── Newsletter ────────────────────────────────────────────────────────────────

export interface NewsletterSubscribePayload {
    email: string;
    name?: string;
    cf_turnstile_response?: string;
}

export interface NewsletterSegment {
    id: number;
    name: string;
    description: string | null;
}

export interface NewsletterPreferences {
    email: string;
    first_name: string | null;
    is_active: boolean;
    active_segments: number[];
    available_segments: NewsletterSegment[];
}

export interface UpdateNewsletterPreferencesPayload {
    first_name?: string | null;
    is_active: boolean;
    segments: number[];
}

// ── Forms ─────────────────────────────────────────────────────────────────────

export type FormFieldType =
    | 'text'
    | 'email'
    | 'phone'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'date'
    | 'number'
    | 'file';

export interface FormField {
    id: number;
    name: string;
    label: string;
    type: FormFieldType;
    placeholder: string | null;
    is_required: boolean;
    options: string[] | null;
    position: number;
}

export interface Form {
    id: number;
    name: string;
    description: string | null;
    fields: FormField[];
    success_message: string | null;
    redirect_url: string | null;
}

// ── Blog ──────────────────────────────────────────────────────────────────────

export interface BlogCategory {
    id: number;
    name: string;
    slug: string;
    description: string | null;
}

export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    canonical_slug: string;
    slug_translations: Record<string, string>;
    available_locales: string[];
    translation_group_id: string | null;
    excerpt: string | null;
    content: string;
    content_type: string;
    /** URL string stored directly on the model */
    featured_image: string | null;
    tags: string[];
    is_featured: boolean;
    views_count: number | null;
    votes_up?: number;
    votes_down?: number;
    user_vote?: 'up' | 'down' | null;
    category: BlogCategory | null;
    author: { id: number; name: string } | null;
    status: string;
    published_at: string | null;
    reading_time: number | null;
    seo_title: string | null;
    seo_description: string | null;
    canonical_url: string | null;
    public_url?: string | null;
    meta_robots: string;
    og_image: string | null;
    sitemap_exclude: boolean;
    created_at: string;
    updated_at: string;
}

export interface BlogComment {
    id: number;
    body: string;
    parent_id: number | null;
    user: { id: number; name: string };
    replies: BlogComment[];
    created_at: string;
}

// ── CMS – Menus ───────────────────────────────────────────────────────────────

export interface MenuItem {
    id: number;
    label: string;
    url: string | null;
    target: '_blank' | '_self';
    icon: string | null;
    children?: MenuItem[];
}

export interface Menu {
    id: number;
    name: string;
    location: string;
    items: MenuItem[];
}

// ── CMS – Pages & Page Builder ────────────────────────────────────────────────

export type PageType = 'blocks' | 'module';
export type PageLayout = 'default' | 'full_width' | 'sidebar';
export type SectionLayout =
    | 'contained'
    | 'full-width'
    | 'flush'
    | 'two-col'
    | 'three-col';
export type SectionVariant =
    | 'light'
    | 'dark'
    | 'muted'
    | 'brand'
    | 'hero'
    | null;

export interface BlockRelation {
    id?: number;
    relation_type: string;
    relation_id: number;
    relation_key: string | null;
    position: number;
    metadata: Record<string, unknown> | null;
    /** Resolved model data included by the API */
    data?: Record<string, unknown> | null;
}

export interface PageBlock {
    id: number;
    type: BlockType;
    configuration: Record<string, unknown>;
    position: number;
    is_active: boolean;
    relations: BlockRelation[];
    reusable_block_id: number | null;
}

export interface PageSection {
    id: number;
    section_type: string;
    layout: SectionLayout;
    variant: SectionVariant;
    settings: Record<string, unknown> | null;
    position: number;
    is_active: boolean;
    blocks: PageBlock[];
}

export type BlockType =
    | 'hero_banner'
    | 'rich_text'
    | 'featured_products'
    | 'categories_grid'
    | 'promotional_banner'
    | 'newsletter_signup'
    | 'testimonials'
    | 'image_gallery'
    | 'video_embed'
    | 'custom_html'
    | 'two_columns'
    | 'three_columns'
    | 'accordion'
    | 'tabs'
    | 'form_embed'
    | 'map'
    | 'featured_posts'
    | 'stats_counter'
    | 'call_to_action'
    | 'pricing_table'
    | 'brands_slider'
    | 'logo_cloud'
    | 'countdown_timer'
    | 'timeline'
    | 'team_members'
    | 'icon_list'
    | 'steps_process'
    | 'trust_badges'
    | 'alert_banner'
    | 'pricing_cards';

export interface Page {
    id: number;
    title: string;
    slug: string;
    path: string;
    page_type: PageType;
    layout: PageLayout;
    module_name: string | null;
    system_page_key: string | null;
    module_config: Record<string, unknown> | null;
    content: string | null;
    excerpt: string | null;
    is_published: boolean;
    published_at: string | null;
    seo_title: string | null;
    seo_description: string | null;
    seo_canonical: string | null;
    meta_robots: string;
    og_image: string | null;
    sitemap_exclude: boolean;
    sections: PageSection[];
    children?: Page[];
}

// ── Stores ────────────────────────────────────────────────────────────────────

export interface Store {
    id: number;
    name: string;
    slug: string;
    address: string;
    city: string;
    country: string;
    phone: string | null;
    email: string | null;
    opening_hours: Record<string, string> | null;
    lat: number;
    lng: number;
}

export interface Faq {
    id: number;
    question: string;
    answer: string;
    position: number;
    category?: string | null;
    is_active?: boolean;
}

// ── Settings ──────────────────────────────────────────────────────────────────

export interface PublicSettings {
    site_name: string | null;
    site_logo_url: string | null;
    site_favicon_url: string | null;
    currency: string | null;
    locale: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    social_links: Record<string, string> | null;
}

export interface PrivacyRequest {
    id: number;
    type: string;
    status: string;
    email: string | null;
    payload: Record<string, unknown> | null;
    resolution_note: string | null;
    requested_at: string | null;
    resolved_at: string | null;
}

export interface StorefrontRoutes {
    product_listing: string;
    category_listing: string;
    brand_listing: string;
    blog_listing: string;
    search_results: string;
    faq_page: string | null;
    returns_portal: string | null;
    contact_page: string | null;
    privacy_policy: string | null;
    cookie_policy: string | null;
    terms_of_service: string | null;
    shipping_policy: string | null;
    return_policy: string | null;
}

// ── Error ─────────────────────────────────────────────────────────────────────

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

// ── Promotions ────────────────────────────────────────────────────────────────

export interface ActivePromotion {
    id: number;
    name: string;
    banner_text: string;
    banner_color: string | null;
    banner_url: string | null;
    ends_at: string | null;
}

export interface CustomerNotification {
    id: number;
    type: string;
    title: string;
    body: string;
    data: Record<string, unknown> | null;
    read_at: string | null;
    action_url: string | null;
    created_at: string | null;
}

export interface FlashSale {
    id: number;
    name: string;
    product_id: number;
    variant_id: number | null;
    /** sale price in cents */
    sale_price: number;
    ends_at: string | null;
    stock_remaining: number | null;
    product: { id: number; name: string; slug: string } | null;
    variant: { id: number; sku: string } | null;
}

// ── Support Chat ──────────────────────────────────────────────────────────────

export interface SupportMessage {
    id: number;
    sender_type: 'customer' | 'agent';
    sender_name: string;
    body: string;
    is_internal: boolean;
    read_at: string | null;
    created_at: string;
}

export interface SupportConversation {
    id: number;
    token: string;
    subject: string;
    status: 'open' | 'pending' | 'resolved' | 'closed';
    channel: 'widget' | 'email';
    email: string | null;
    name: string | null;
    last_reply_at: string | null;
    created_at: string;
    messages: SupportMessage[];
}

// ── Global Slots ──────────────────────────────────────────────────────────────

export interface SlotSettings {
    full_width?: boolean;
    sticky?: boolean;
    dismissible?: boolean;
    bg_color?: string | null;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface SlotEntry {
    id: number;
    label: string;
    block_type: string;
    configuration: Record<string, unknown>;
    relations?: BlockRelation[];
    settings: SlotSettings;
    position: number;
}
