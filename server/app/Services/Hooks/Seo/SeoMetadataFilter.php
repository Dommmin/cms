<?php

declare(strict_types=1);

namespace App\Services\Hooks\Seo;

use Illuminate\Database\Eloquent\Model;

final class SeoMetadataFilter
{
    /**
     * @param  array{title: ?string, description: ?string, og_image: ?string, robots: ?string, canonical: ?string}  $metadata
     */
    public function __construct(
        public array $metadata,
        public readonly Model $model
    ) {}
}
