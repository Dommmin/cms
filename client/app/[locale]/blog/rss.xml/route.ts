import { blogRssResponse } from '@/app/_routes/blog-rss';
import { resolveLocale } from '@/lib/i18n-server';

export async function GET(
    _request: Request,
    {
        params,
    }: {
        params: Promise<{ locale: string }>;
    },
): Promise<Response> {
    const { locale: rawLocale } = await params;
    const locale = await resolveLocale(rawLocale);

    return blogRssResponse(locale);
}
