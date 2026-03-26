import type { PageBlock } from '@/types/api';

export interface Plan {
  name?: string;
  badge?: string;
  price_monthly?: string;
  price_yearly?: string;
  description?: string;
  features?: string;
  cta_label?: string;
  cta_url?: string;
  is_featured?: boolean;
}
export interface PricingTableConfig {
  title?: string;
  subtitle?: string;
  currency_symbol?: string;
  billing_toggle?: boolean;
  plans?: Plan[];
}
export interface PricingTableProps {
  block: PageBlock;
}
