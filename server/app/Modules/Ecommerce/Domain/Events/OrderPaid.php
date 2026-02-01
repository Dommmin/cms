<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Events;

use App\Modules\Ecommerce\Domain\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Order Paid Event
 * Dispatched when an order payment is completed
 */
final class OrderPaid
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Order $order
    ) {}
}

