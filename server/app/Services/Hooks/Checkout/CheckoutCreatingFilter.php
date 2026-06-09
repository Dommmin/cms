<?php

declare(strict_types=1);

namespace App\Services\Hooks\Checkout;

use App\Models\Cart;

final class CheckoutCreatingFilter
{
    /**
     * @param array<string, mixed> $orderData
     */
    public function __construct(
        public array $orderData,
        public readonly Cart $cart
    ) {}
}
