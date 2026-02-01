<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Events;

use App\Modules\Ecommerce\Domain\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Order Delivered Event
 * Dispatched when an order is delivered
 */
final class OrderDelivered
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Order $order
    ) {}
}

