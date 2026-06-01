import type { PageProps } from './page.types';
import { SharedCartPageClient } from './shared-cart-page-client';

export default async function SharedCartPage({ params }: PageProps) {
    const { token } = await params;

    return <SharedCartPageClient token={token} />;
}
