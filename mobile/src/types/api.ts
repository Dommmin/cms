// Mobile API contracts mirror client/types/api.ts for shared Laravel REST endpoints.

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

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  two_factor_confirmed_at: string | null;
  created_at: string;
  processing_restricted_at: string | null;
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
  price: number;
  compare_at_price: number | null;
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

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: number | null;
  children?: Category[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price_min: number;
  price_max: number;
  is_active: boolean;
  is_featured: boolean;
  is_on_sale: boolean;
  discount_percentage?: number | null;
  compare_at_price_min: number | null;
  omnibus_price_min: number | null;
  thumbnail: ProductImage | null;
  images: ProductImage[];
  variants: ProductVariant[];
  category: Category | null;
  brand: Brand | null;
  attributes: Attribute[];
  attribute_map?: Record<string, string[]>;
  product_type_id?: number | null;
  created_at: string;
  seo_title: string | null;
  seo_description: string | null;
  meta_description: string | null;
  meta_robots: string;
  og_image: string | null;
  sitemap_exclude: boolean;
}

export interface CartItem {
  id: number;
  variant_id: number;
  product: Pick<Product, 'id' | 'name' | 'slug' | 'thumbnail'>;
  variant: ProductVariant;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  token: string;
  items: CartItem[];
  subtotal: number;
  discount_amount: number;
  total: number;
  discount_code: string | null;
  currency: string;
  items_count: number;
}

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
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  reference_number: string;
  status: OrderStatus;
  status_label?: string;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  currency_code: string;
  notes?: string | null;
  items: OrderItem[];
  created_at: string;
}

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed' | 'authorized' | 'refunded' | 'partially_refunded';
  order_reference: string | null;
}

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

export interface SearchFacetCategory {
  id: string;
  slug: string;
  name: string;
  count: number;
}

export interface SearchFacetBrand {
  id: string;
  name: string;
  count: number;
}

export interface SearchFacets {
  categories: SearchFacetCategory[];
  brands: SearchFacetBrand[];
  price_ranges: {
    min: number;
    max: number;
  };
}

export interface SearchMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  facets: SearchFacets;
  did_you_mean: string | null;
}

export interface SearchProduct {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price_min: number;
  price_max: number;
  is_active: boolean;
  is_featured: boolean;
  is_on_sale: boolean;
  discount_percentage: number | null;
  compare_at_price_min: number | null;
  omnibus_price_min: number | null;
  thumbnail: ProductImage | null;
  category: Pick<Category, 'id' | 'name' | 'slug'> | null;
  brand: Pick<Brand, 'id' | 'name'> | null;
}

export interface SearchResult {
  data: SearchProduct[];
  meta: SearchMeta;
}

export interface SearchSuggestion {
  id: number;
  name: string;
  slug: string;
  thumbnail: string;
  price: number;
}

export interface AutocompleteResult {
  suggestions: SearchSuggestion[];
}

export interface SearchFilters {
  q?: string;
  category?: string;
  brand?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
  page?: number;
  per_page?: number;
}

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

export interface AddressPayload {
  first_name: string;
  last_name: string;
  company_name?: string;
  street: string;
  street2?: string;
  city: string;
  postal_code: string;
  country_code: string;
  phone: string;
}

export interface ShippingMethod {
  id: number;
  name: string;
  description: string | null;
  carrier: string | null;
  base_price: number;
  free_shipping_threshold: number | null;
  estimated_days_min: number | null;
  estimated_days_max: number | null;
  requires_pickup_point: boolean;
  uses_native_widget: boolean;
  configured?: boolean;
  missing_config?: string[];
}

export interface PaymentMethodConfig {
  id: 'cash_on_delivery' | 'payu' | 'p24' | 'apple_pay' | 'google_pay' | 'bank_transfer';
  configured: boolean;
  missing_env: string[];
}

export interface CheckoutPayload {
  guest_email?: string;
  shipping_method_id: number;
  pickup_point_id?: string;
  payment_provider: string;
  payment_method?: string;
  blik_code?: string;
  payment_token?: string;
  billing_address: AddressPayload;
  shipping_address: AddressPayload;
  notes?: string;
  terms_accepted?: boolean;
  referral_code?: string;
}

export interface CheckoutResponse {
  order: {
    id: number;
    reference_number: string;
    status: string;
    total: number;
    currency_code: string;
    created_at: string;
  };
  payment: {
    id: number | null;
    action: 'redirect' | 'wait' | 'none';
    redirect_url: string | null;
  };
}

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
  featured_image: string | null;
  tags: string[];
  is_featured: boolean;
  views_count: number | null;
  category: BlogCategory | null;
  author: { id: number; name: string } | null;
  status: string;
  published_at: string | null;
  reading_time: number | null;
  created_at: string;
  updated_at: string;
}

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

export interface NewsletterSubscribePayload {
  email: string;
  name?: string;
  cf_turnstile_response?: string;
}

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
  data?: Record<string, unknown> | null;
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
  | 'call_to_action'
  | 'pricing_cards'
  | string;

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

export interface Page {
  id: number;
  title: string;
  slug: Record<string, string>;
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
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
