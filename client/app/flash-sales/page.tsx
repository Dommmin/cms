import { getI18nConfig } from '@/lib/i18n-server';
import { generateAlternates } from '@/lib/seo';
import type { Metadata } from 'next';
import FlashSalesClient from './FlashSalesClient';

export async function generateMetadata(): Promise<Metadata> {
    const i18nConfig = await getI18nConfig();

    return {
        title: 'Flash Sales',
        description: 'Limited-time flash deals with countdown timers',
        alternates: generateAlternates(
            '/flash-sales',
            i18nConfig.defaultLocale,
            i18nConfig,
        ),
    };
}

export default function FlashSalesPage() {
    return <FlashSalesClient />;
}
