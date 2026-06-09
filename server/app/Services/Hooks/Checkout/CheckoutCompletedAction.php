<?php

declare(strict_types=1);

namespace App\Services\Hooks\Checkout;

use App\Models\Order;

final readonly class CheckoutCompletedAction
{
    public function __construct(
        public Order $order
    ) {}
}
