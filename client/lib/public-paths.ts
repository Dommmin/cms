import type { BlogPost, Brand, Category, Product } from '@/types/api';

export function resolveProductPath(
    product: Pick<Product, 'slug' | 'public_url'>,
): string {
    if (!product.public_url) {
        throw new Error('Missing public_url for product.');
    }

    return product.public_url;
}

export function resolveCategoryPath(
    category: Pick<Category, 'slug' | 'public_url'>,
): string {
    if (!category.public_url) {
        throw new Error('Missing public_url for category.');
    }

    return category.public_url;
}

export function resolveBrandPath(
    brand: Pick<Brand, 'slug' | 'public_url'>,
): string {
    if (!brand.public_url) {
        throw new Error('Missing public_url for brand.');
    }

    return brand.public_url;
}

export function resolveBlogPostPath(
    post: Pick<BlogPost, 'slug' | 'public_url'>,
): string {
    if (!post.public_url) {
        throw new Error('Missing public_url for blog post.');
    }

    return post.public_url;
}
