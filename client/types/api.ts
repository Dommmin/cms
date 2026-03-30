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
  };
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  two_factor_confirmed_at: string | null;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
  cart_token?: string | null;
  cf_turnstile_response?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  cart_token?: string | null;
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
  attributes: Record<string, string>;
  tax_rate?: number | null;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  /** min price across variants, in cents */
  price_min: number;
  /** max price across variants, in cents */
  price_max: number;
  is_active: boolean;
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
  /** Aggregated attribute values per key, present only in compare endpoint response */
  attribute_map?: Record<string, string[]>;
  product_type_id?: number | null;
  created_at: string;
  seo_title: string | null;
  seo_description: string | null;
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
  children?: Category[];
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
  token: string;
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
  | 'pending'
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
}

export interface Shipment {
  id: number;
  carrier: string;
  tracking_number: string | null;
  status: string;
  shipped_at: string | null;
}

export interface Payment {
  id: number;
  method: string;
  payment_method: string | null;
  status: string;
  amount: number;
  paid_at: string | null;
}

export interface OrderStatusHistory {
  status: string;
  note: string | null;
  created_at: string;
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
  created_at: string;
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
  excerpt: string | null;
  content: string;
  content_type: string;
  /** URL string stored directly on the model */
  featured_image: string | null;
  tags: string[];
  is_featured: boolean;
  views_count: number;
  category: BlogCategory | null;
  author: { id: number; name: string } | null;
  status: string;
  published_at: string | null;
  reading_time: number | null;
  seo_title: string | null;
  seo_description: string | null;
  meta_robots: string;
  og_image: string | null;
  sitemap_exclude: boolean;
  created_at: string;
  updated_at: string;
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
export type SectionLayout = 'contained' | 'full-width' | 'flush' | 'two-col' | 'three-col';
export type SectionVariant = 'light' | 'dark' | 'muted' | 'brand' | 'hero' | null;

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
  | 'trust_badges';

export interface Page {
  id: number;
  title: string;
  slug: string;
  page_type: PageType;
  layout: PageLayout;
  module_name: string | null;
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

// ── FAQ ───────────────────────────────────────────────────────────────────────

export interface Faq {
  id: number;
  question: string;
  answer: string;
  position: number;
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

// ── Error ─────────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
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
