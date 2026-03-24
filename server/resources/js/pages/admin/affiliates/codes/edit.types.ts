export type User = { id: number; name: string; email: string };
export type AffiliateCode = {
    id: number;
    code: string;
    user_id: number;
    discount_type: 'percentage' | 'fixed' | 'none';
    discount_value: number;
    commission_rate: string;
    max_uses: number | null;
    uses_count: number;
    is_active: boolean;
    expires_at: string | null;
    notes: string | null;
    user: User;
};
export type EditProps = {
    code: AffiliateCode;
    users: User[];
};
