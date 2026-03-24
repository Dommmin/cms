export type ExchangeRate = {
    rate: number;
    fetched_at: string;
};
export type Currency = {
    id: number;
    code: string;
    name: string;
    symbol: string;
    decimal_places: number;
    is_active: boolean;
    is_base: boolean;
    exchange_rates: ExchangeRate[];
};
export type CurrenciesData = {
    data: Currency[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type IndexProps = {
    currencies: CurrenciesData;
    filters: { search?: string; is_active?: string };
};
