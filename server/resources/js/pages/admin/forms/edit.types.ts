export type FieldData = {
    id?: number;
    label: string;
    name: string;
    type: string;
    placeholder: string;
    is_required: boolean;
    options: string[];
};
export type FormData = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    notify_emails: string[];
    is_active: boolean;
    fields: Array<{
        id: number;
        label: string;
        name: string;
        type: string;
        placeholder?: string | null;
        is_required: boolean;
        options: string[] | null;
        settings: { placeholder?: string | null } | null;
    }>;
};
