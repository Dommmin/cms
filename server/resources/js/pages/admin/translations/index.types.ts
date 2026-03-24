export type LocaleOption = { code: string; name: string; flag_emoji: string | null };
export type Translation = {
    id: number;
    locale_code: string;
    group: string;
    key: string;
    value: string;
};
export type TranslationsData = {
    data: Translation[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type IndexProps = {
    translations: TranslationsData;
    locales: LocaleOption[];
    groups: string[];
    filters: {
        locale?: string;
        group?: string;
        search?: string;
        missing?: string;
    };
};
