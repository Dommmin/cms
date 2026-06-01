<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\OrderPaid;
use App\Jobs\SyncOrderToBaseLinkerJob;
use App\Services\BaseLinkerService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

final class SyncOrderToBaseLinkerListener implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        private readonly BaseLinkerService $baseLinker,
    ) {}

    public function handle(OrderPaid $event): void
    {
        if (! $this->baseLinker->isConfigured()) {
            return;
        }

        // Only dispatch if the order hasn't been synced yet
        if ($event->order->baselinker_order_id === null) {
            dispatch(new SyncOrderToBaseLinkerJob($event->order));
        }
    }
}
