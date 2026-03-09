<?php

declare(strict_types=1);

namespace App\States\Order;

class RefundedState extends OrderState
{
    public static string $name = 'refunded';
}
