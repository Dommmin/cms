export { default } from '@/app/search/page';
import { generateSearchMetadata } from '@/app/search/page';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    return generateSearchMetadata(locale);
}
