export interface Locale {
    code: string;
    name: string;
    native_name?: string | null;
    flag_emoji?: string | null;
    is_default: boolean;
}
export interface LocaleTabSwitcherProps {
    locales: Locale[];
    activeLocale: string;
    onLocaleChange: (locale: string) => void;
    className?: string;
}
