import {
    BlogPostOpenGraphImage,
    contentType,
    size,
} from '@/app/_routes/blog-post-og-image';
import { resolveLocale } from '@/lib/i18n-server';
import type { PageProps } from './page.types';

export { contentType, size };

export default async function Image({ params }: PageProps) {
    const { locale: rawLocale, slug } = await params;
    const locale = await resolveLocale(rawLocale);

    return BlogPostOpenGraphImage({ slug, locale });
}
