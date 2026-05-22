import { blogRss } from '@/lib/blog-rss';
import { DEFAULT_LOCALE } from '@/lib/i18n';

export async function GET(): Promise<Response> {
    return blogRss(DEFAULT_LOCALE);
}
