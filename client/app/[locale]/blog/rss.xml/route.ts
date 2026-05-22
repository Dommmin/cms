import { blogRss } from '@/lib/blog-rss';

export async function GET(
    _request: Request,
    {
        params,
    }: {
        params: Promise<{ locale: string }>;
    },
): Promise<Response> {
    const { locale } = await params;

    return blogRss(locale);
}
