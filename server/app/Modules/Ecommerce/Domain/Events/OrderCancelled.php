<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Events;

use App\Modules\Ecommerce\Domain\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Order Cancelled Event
 * Dispatched when an order is cancelled
 */
final class OrderCancelled
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Order $order
    ) {}
}

