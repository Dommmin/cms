import type { BlogPost } from '@/types/api';

export interface BlogPostClientProps {
    post: BlogPost;
    relatedPosts?: BlogPost[];
    locale: string;
    basePath: string;
}
