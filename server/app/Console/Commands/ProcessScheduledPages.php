<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Page;
use Illuminate\Console\Command;

class ProcessScheduledPages extends Command
{
    protected $signature = 'cms:process-scheduled-pages';

    protected $description = 'Publish and unpublish pages based on scheduled dates';

    public function handle(): void
    {
        $this->publishScheduled();
        $this->unpublishScheduled();
    }

    private function publishScheduled(): void
    {
        Page::query()
            ->where('is_published', false)
            ->whereNotNull('scheduled_publish_at')
            ->where('scheduled_publish_at', '<=', now())
            ->each(function (Page $page): void {
                $page->update([
                    'is_published' => true,
                    'published_at' => now(),
                    'scheduled_publish_at' => null,
                ]);

                $this->info("Published page: [{$page->id}] {$page->title}");
            });
    }

    private function unpublishScheduled(): void
    {
        Page::query()
            ->where('is_published', true)
            ->whereNotNull('scheduled_unpublish_at')
            ->where('scheduled_unpublish_at', '<=', now())
            ->each(function (Page $page): void {
                $page->update([
                    'is_published' => false,
                    'scheduled_unpublish_at' => null,
                ]);

                $this->info("Unpublished page: [{$page->id}] {$page->title}");
            });
    }
}
