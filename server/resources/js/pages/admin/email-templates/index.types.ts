export interface EmailTemplate {
    id: number;
    name: string;
    key: string;
    subject: string;
    description: string | null;
    is_active: boolean;
    variables: string[] | null;
}

export interface IndexProps {
    templates: {
        data: EmailTemplate[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
}
