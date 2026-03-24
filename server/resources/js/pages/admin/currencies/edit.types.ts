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
export type EditProps = {
    currency: Currency;
};
