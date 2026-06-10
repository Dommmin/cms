import { cookies } from 'next/headers';

import { getMenu } from '@/api/cms';
import { getPublicSettings } from '@/api/settings';
import type { MenuItem } from '@/types/api';

import { FooterContent } from './footer-content';

export async function Footer() {
    const cookieStore = await cookies();
    const locale = cookieStore.get('locale')?.value ?? 'en';

    let mainItems: MenuItem[] = [];
    let legalItems: MenuItem[] = [];

    try {
        const menu = await getMenu('footer', locale);
        mainItems = menu.items ?? [];
    } catch {
        // menu not seeded yet
    }

    try {
        const menu = await getMenu('footer_legal', locale);
        legalItems = menu.items ?? [];
    } catch {
        // menu not seeded yet
    }

    const publicSettings = await getPublicSettings();
    const siteName = publicSettings?.settings?.general?.site_name ?? 'Store';
    const siteDescription = publicSettings?.settings?.general?.site_description;

    return (
        <FooterContent
            mainItems={mainItems}
            legalItems={legalItems}
            currentYear={new Date().getFullYear()}
            siteName={siteName}
            siteDescription={siteDescription}
        />
    );
}
