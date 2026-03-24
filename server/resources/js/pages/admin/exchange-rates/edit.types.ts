export type Currency = {
    id: number;
    code: string;
    name: string;
};
export type ExchangeRate = {
    id: number;
    currency_id: number;
    rate: number;
    source: string | null;
    fetched_at: string;
};
export type EditProps = {
    rate: ExchangeRate;
    currencies: Currency[];
};
