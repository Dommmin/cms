import {
    BlogPostOpenGraphImage,
    contentType,
    size,
} from '@/app/_routes/blog-post-og-image';
import { getDefaultLocale } from '@/lib/i18n-server';
import type { PageProps } from './page.types';

export { contentType, size };

export default async function Image({ params }: PageProps) {
    const { slug } = await params;

    return BlogPostOpenGraphImage({ slug, locale: await getDefaultLocale() });
}
