<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Data;

class ProductData extends Data
{
    public function __construct(
        public int $id,
        public ?int $category_id,
        public ?int $brand_id,
        public string $name,
        public string $slug,
        public ?string $short_description,
        public bool $is_active,
        public int $price_min,
        public int $price_max,
        public bool $is_on_sale = false,
        public ?int $discount_percentage = null,
        public ?string $seo_title = null,
        public ?string $seo_description = null,
        public bool $sitemap_exclude = false,
        /** @var CategoryData|null Included when relation loaded */
        public ?CategoryData $category = null,
        /** @var BrandData|null Included when relation loaded */
        public ?BrandData $brand = null,
        /** @var ProductImageData|null Included when relation loaded */
        public ?ProductImageData $thumbnail = null,
    ) {}
}
