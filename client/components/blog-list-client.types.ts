import type { BlogPostParams } from '@/hooks/use-blog';

export interface BlogListClientProps {
    params: BlogPostParams & { locale: string };
}
