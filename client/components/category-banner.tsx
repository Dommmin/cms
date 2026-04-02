'use client';

import Image from 'next/image';

import { useCategory } from '@/hooks/use-cms';
import type { CategoryBannerProps } from './category-banner.types';

export function CategoryBanner({ slug }: CategoryBannerProps) {
    const { data: category } = useCategory(slug);

    if (!category) return null;

    return (
        <div className="relative mb-8 overflow-hidden rounded-2xl">
            {category.image_url ? (
                <div className="relative h-40 w-full sm:h-52">
                    <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-4 text-center text-white">
                        <h1 className="text-2xl font-bold sm:text-3xl">
                            {category.name}
                        </h1>
                        {category.description && (
                            <p className="max-w-lg text-sm opacity-90">
                                {category.description}
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-muted flex flex-col items-center justify-center gap-1 rounded-2xl px-4 py-10 text-center">
                    <h1 className="text-2xl font-bold">{category.name}</h1>
                    {category.description && (
                        <p className="text-muted-foreground max-w-lg text-sm">
                            {category.description}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
