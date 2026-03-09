<?php

declare(strict_types=1);

namespace App\States\Order;

class CancelledState extends OrderState
{
    public static string $name = 'cancelled';
}
