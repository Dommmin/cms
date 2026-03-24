export type Faq = {
    id: number;
    question: string;
    answer: string;
    category: string | null;
    is_active: boolean;
    position: number;
    views_count: number;
    helpful_count: number;
};
export type EditProps = {
    faq: Faq;
    categories: string[];
};
