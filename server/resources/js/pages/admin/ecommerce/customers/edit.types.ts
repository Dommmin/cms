export interface CustomerEdit {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    company_name: string | null;
    tax_id: string | null;
    notes: string | null;
    is_active: boolean;
}
