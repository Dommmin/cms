export type LocaleData = {
    code: string;
    name: string;
    native_name: string;
    flag_emoji: string;
    is_default: boolean;
};
export interface LocalizedInputProps {
    label: string;
    value: Record<string, string>;
    onChange: (value: Record<string, string>) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
}
