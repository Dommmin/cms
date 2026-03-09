<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Page;
use App\Services\PageCacheService;

class PageObserver
{
    public function __construct(
        private readonly PageCacheService $cacheService
    ) {}

    /**
     * Handle the Page "updated" event.
     */
    public function updated(Page $page): void
    {
        $this->cacheService->invalidatePage($page);
    }

    /**
     * Handle the Page "deleted" event.
     */
    public function deleted(Page $page): void
    {
        $this->cacheService->invalidatePage($page);
    }

    /**
     * Handle the Page "saved" event.
     */
    public function saved(Page $page): void
    {
        if ($page->is_published) {
            $this->cacheService->invalidatePage($page);
        }
    }
}
