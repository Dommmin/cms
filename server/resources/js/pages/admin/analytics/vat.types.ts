export interface VatMonthRow {
    month: string;
    vat: number;
    net: number;
    gross: number;
    count: number;
}

export interface VatData {
    orders_count: number;
    net_total: number;
    vat_total: number;
    gross_total: number;
    effective_vat_rate: number;
    by_month: VatMonthRow[];
}

export interface VatProps {
    data: VatData;
    filters: {
        from: string;
        to: string;
    };
}
