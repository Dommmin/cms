import type { PageBlock } from '@/types/api';

export interface NewsletterSignupConfig {
    title?: string;
    subtitle?: string;
    placeholder?: string;
    button_text?: string;
    success_message?: string;
    ask_name?: boolean;
}
export interface NewsletterSignupProps {
    block: PageBlock;
}
