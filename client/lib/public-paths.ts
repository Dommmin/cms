import type { BlogPost, Brand, Category, Product } from '@/types/api';

export function resolveProductPath(
    product: Pick<Product, 'slug' | 'public_url'>,
): string {
    return product.public_url ?? `/products/${product.slug}`;
}

export function resolveCategoryPath(
    category: Pick<Category, 'slug' | 'public_url'>,
): string {
    return category.public_url ?? `/categories/${category.slug}`;
}

export function resolveBrandPath(
    brand: Pick<Brand, 'slug' | 'public_url'>,
): string {
    return brand.public_url ?? `/brands/${brand.slug}`;
}

export function resolveBlogPostPath(
    post: Pick<BlogPost, 'slug' | 'public_url'>,
): string {
    return post.public_url ?? `/blog/${post.slug}`;
}
