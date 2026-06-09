<?php

declare(strict_types=1);

namespace App\Services\Hooks\Cms;

use App\Models\Page;

final class PagePublishedAction
{
    public function __construct(
        public readonly Page $page
    ) {}
}
