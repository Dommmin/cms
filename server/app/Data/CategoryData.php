<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Data;

class CategoryData extends Data
{
    public function __construct(
        public int $id,
        public ?int $parent_id,
        public ?int $product_type_id,
        public string $name,
        public string $slug,
        public ?string $description,
        public ?string $image_path,
        public bool $is_active,
        public int $position,
        public ?string $seo_title,
        public ?string $seo_description,
        public ?string $canonical_url = null,
        public string $meta_robots = 'index, follow',
        public ?string $og_image = null,
        public bool $sitemap_exclude = false,
    ) {}
}
