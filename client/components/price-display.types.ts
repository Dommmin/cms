export interface PriceDisplayProps {
    price: number;
    compareAtPrice?: number | null;
    omnibusPrice?: number | null;
    isOnSale?: boolean;
    /** Tailwind text size class for the main price, e.g. "text-lg" (default) or "text-sm" */
    size?: 'sm' | 'base' | 'lg';
    className?: string;
}
