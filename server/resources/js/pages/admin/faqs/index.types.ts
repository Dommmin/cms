export type Faq = {
    id: number;
    question: string;
    answer: string;
    category: string | null;
    is_active: boolean;
    position: number;
    views_count: number;
    helpful_count: number;
    created_at: string;
};
export type FaqsData = {
    data: Faq[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type IndexProps = {
    faqs: FaqsData;
    filters: { search?: string; category?: string; is_active?: string };
    categories: string[];
};
