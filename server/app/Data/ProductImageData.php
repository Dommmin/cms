<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Data;

class ProductImageData extends Data
{
    public function __construct(
        public int $id,
        public string $path,
        public ?string $alt_text,
        public bool $is_thumbnail,
        public int $position,
    ) {}
}
