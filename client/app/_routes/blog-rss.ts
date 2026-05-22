import { blogRss } from '@/lib/blog-rss';
import { type Locale } from '@/lib/i18n';

export function blogRssResponse(locale: Locale): Promise<Response> {
    return blogRss(locale);
}
