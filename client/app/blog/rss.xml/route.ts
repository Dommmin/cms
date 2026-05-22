import { blogRssResponse } from '@/app/_routes/blog-rss';
import { getDefaultLocale } from '@/lib/i18n-server';

export async function GET(): Promise<Response> {
    return blogRssResponse(await getDefaultLocale());
}
