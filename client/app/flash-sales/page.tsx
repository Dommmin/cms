import { generateAlternates } from '@/lib/seo';
import type { Metadata } from 'next';
import FlashSalesClient from './FlashSalesClient';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Flash Sales',
        description: 'Limited-time flash deals with countdown timers',
        alternates: generateAlternates('/flash-sales'),
    };
}

export default function FlashSalesPage() {
    return <FlashSalesClient />;
}
