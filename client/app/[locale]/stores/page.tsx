export { default } from '@/app/stores/page';
import { generateStoresMetadata } from '@/app/stores/stores-metadata';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    return generateStoresMetadata(locale);
}
