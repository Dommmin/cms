<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Page;
use App\Services\PagePublicationWebhookService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Description('Publish and unpublish pages based on scheduled dates')]
#[Signature('cms:process-scheduled-pages')]
class ProcessScheduledPages extends Command
{
    public function handle(PagePublicationWebhookService $publicationWebhookService): void
    {
        $this->publishScheduled($publicationWebhookService);
        $this->unpublishScheduled($publicationWebhookService);
    }

    private function publishScheduled(PagePublicationWebhookService $publicationWebhookService): void
    {
        Page::query()
            ->where('is_published', false)
            ->whereNotNull('scheduled_publish_at')
            ->where('scheduled_publish_at', '<=', now())
            ->each(function (Page $page) use ($publicationWebhookService): void {
                $page->update([
                    'is_published' => true,
                    'published_at' => now(),
                    'scheduled_publish_at' => null,
                ]);
                $publicationWebhookService->dispatchPublished($page->refresh(), 'scheduled');

                $this->info(sprintf('Published page: [%d] %s', $page->id, $page->title));
            });
    }

    private function unpublishScheduled(PagePublicationWebhookService $publicationWebhookService): void
    {
        Page::query()
            ->where('is_published', true)
            ->whereNotNull('scheduled_unpublish_at')
            ->where('scheduled_unpublish_at', '<=', now())
            ->each(function (Page $page) use ($publicationWebhookService): void {
                $page->update([
                    'is_published' => false,
                    'scheduled_unpublish_at' => null,
                ]);
                $publicationWebhookService->dispatchUnpublished($page->refresh(), 'scheduled');

                $this->info(sprintf('Unpublished page: [%d] %s', $page->id, $page->title));
            });
    }
}
