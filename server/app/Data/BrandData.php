<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Data;

class BrandData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public string $slug,
        public ?string $description,
        public ?string $logo_path,
        public bool $is_active,
        public int $position,
    ) {}
}
