export type Referral = {
    id: number;
    status: 'pending' | 'approved' | 'paid' | 'cancelled';
    order_total: number;
    commission_amount: number;
    paid_at: string | null;
    created_at: string;
    affiliate_code: {
        id: number;
        code: string;
        user: { id: number; name: string; email: string };
    };
    order: {
        id: number;
        reference_number: string;
        total: number;
        status: string;
    } | null;
    referred_user: { id: number; name: string; email: string } | null;
};
export type ReferralsData = {
    data: Referral[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type Stats = {
    total_referrals: number;
    pending_commissions: number;
    approved_commissions: number;
    paid_commissions: number;
};
export type IndexProps = {
    referrals: ReferralsData;
    stats: Stats;
    filters: { search?: string; status?: string };
};
