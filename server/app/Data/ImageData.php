<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Data;

class ImageData extends Data
{
    public function __construct(
        public int $id,
        public int $media_id,
        public string $url,
        public string $name,
        public bool $is_thumbnail,
        public int $position,
    ) {}
}
