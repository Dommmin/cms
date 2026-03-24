export type Locale = {
    id: number;
    code: string;
    name: string;
    native_name: string;
    flag_emoji: string | null;
    currency_code: string | null;
    is_default: boolean;
    is_active: boolean;
};
export type CurrencyOption = {
    code: string;
    name: string;
    symbol: string;
};
export type LocalesData = {
    data: Locale[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type IndexProps = {
    locales: LocalesData;
    filters: { search?: string };
    currencies: CurrencyOption[];
};
export type LocaleForm = {
    code: string;
    name: string;
    native_name: string;
    flag_emoji: string;
    currency_code: string;
    is_default: boolean;
    is_active: boolean;
};
