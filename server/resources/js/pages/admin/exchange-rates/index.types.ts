export type Currency = {
    id: number;
    code: string;
    name: string;
};
export type ExchangeRate = {
    id: number;
    currency_id: number;
    currency: Currency;
    rate: number;
    source: string | null;
    fetched_at: string;
};
export type RatesData = {
    data: ExchangeRate[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type IndexProps = {
    rates: RatesData;
    currencies: Currency[];
    filters: { currency_id?: string; source?: string };
};
