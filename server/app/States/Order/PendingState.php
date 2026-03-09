<?php

declare(strict_types=1);

namespace App\States\Order;

class PendingState extends OrderState
{
    public static string $name = 'pending';
}
