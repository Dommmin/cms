export type AffiliateCode = {
    id: number;
    code: string;
    discount_type: 'percentage' | 'fixed' | 'none';
    discount_value: number;
    commission_rate: string;
    max_uses: number | null;
    uses_count: number;
    is_active: boolean;
    expires_at: string | null;
    referrals_count: number;
    referrals_sum_commission_amount: number | null;
    user: { id: number; name: string; email: string };
};
export type CodesData = {
    data: AffiliateCode[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type IndexProps = {
    codes: CodesData;
    filters: { search?: string; status?: string };
};
