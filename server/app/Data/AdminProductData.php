<?php

declare(strict_types=1);

namespace App\Data;

use App\Models\Product;
use Spatie\LaravelData\Data;

class AdminProductData extends Data
{
    public function __construct(
        public ?int $id,
        /** @var array<string, string> */
        public array $name,
        public string $slug,
        /** @var array<string, string>|null */
        public ?array $description,
        /** @var array<string, string>|null */
        public ?array $short_description,
        public ?string $sku_prefix,
        public int $product_type_id,
        public int $category_id,
        public ?int $brand_id,
        public bool $is_active,
        public bool $is_saleable,
        public ?string $seo_title,
        public ?string $seo_description,
        public ?string $available_from,
        public ?string $available_until,
        public ?VariantData $variant,
        /** @var array<int, ImageData> */
        public array $images = [],
        /** @var array<int, CategoryData> */
        public array $categories = [],
        /** @var array<int, int> */
        public array $flag_ids = [],
    ) {}

    public static function fromModel(Product $product): self
    {
        $defaultVariant = $product->defaultVariant;

        $images = $product->images->map(fn ($img): ImageData => new ImageData(
            id: $img->id,
            media_id: $img->media_id,
            url: $img->media?->getUrl() ?? $img->media?->getTemporaryUrl() ?? '',
            name: $img->media?->name ?? '',
            is_thumbnail: $img->is_thumbnail,
            position: $img->position,
        ))->all();

        return new self(
            id: $product->id,
            name: $product->getTranslations('name'),
            slug: $product->slug,
            description: $product->getTranslations('description') ?: null,
            short_description: $product->getTranslations('short_description') ?: null,
            sku_prefix: $product->sku_prefix,
            product_type_id: $product->product_type_id,
            category_id: $product->category_id,
            brand_id: $product->brand_id,
            is_active: $product->is_active,
            is_saleable: $product->is_saleable,
            seo_title: $product->seo_title,
            seo_description: $product->seo_description,
            available_from: $product->available_from?->toIsoString(),
            available_until: $product->available_until?->toIsoString(),
            variant: $defaultVariant ? new VariantData(
                id: $defaultVariant->id,
                sku: $defaultVariant->sku,
                name: $defaultVariant->name,
                price: $defaultVariant->price,
                cost_price: $defaultVariant->cost_price,
                compare_at_price: $defaultVariant->compare_at_price,
                weight: (float) $defaultVariant->weight,
                stock_quantity: $defaultVariant->stock_quantity,
                stock_threshold: $defaultVariant->stock_threshold,
                is_active: $defaultVariant->is_active,
                is_default: $defaultVariant->is_default,
                position: $defaultVariant->position,
            ) : null,
            images: $images,
            categories: $product->categories->map(fn ($cat): CategoryData => CategoryData::from($cat))->all(),
            flag_ids: $product->flags->pluck('id')->values()->all(),
        );
    }
}
