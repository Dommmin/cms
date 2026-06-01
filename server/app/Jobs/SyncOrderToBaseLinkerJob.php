<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Order;
use App\Services\BaseLinkerService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SyncOrderToBaseLinkerJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;

    public int $backoff = 120;

    public function __construct(
        public readonly Order $order
    ) {}

    public function handle(BaseLinkerService $baseLinker): void
    {
        $orderId = $baseLinker->addOrder($this->order);

        if ($orderId) {
            $this->order->update([
                'baselinker_order_id' => (string) $orderId,
            ]);
        } else {
            $this->fail('Failed to sync order to BaseLinker');
        }
    }
}
