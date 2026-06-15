<?php

declare(strict_types=1);

namespace App\Services\PageBuilder;

final class PageRenderContext
{
    public function __construct(
        public readonly ?int $currentCategoryId = null,
        public readonly ?int $currentCollectionId = null,
    ) {}
}
