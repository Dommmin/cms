export type AccordionItem = {
    title: string;
    content: string;
};
export type AccordionProps = {
    heading?: string;
    items: AccordionItem[];
};
