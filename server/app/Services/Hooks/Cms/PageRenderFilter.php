<?php

declare(strict_types=1);

namespace App\Services\Hooks\Cms;

use App\Models\Page;

final class PageRenderFilter
{
    /**
     * @param array<string, mixed> $pageData
     */
    public function __construct(
        public array $pageData,
        public readonly Page $page
    ) {}
}
