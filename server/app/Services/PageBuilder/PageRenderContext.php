<?php

declare(strict_types=1);

namespace App\Services\PageBuilder;

final readonly class PageRenderContext
{
    public function __construct(
        public ?int $currentCategoryId = null,
        public ?int $currentCollectionId = null,
    ) {}
}
