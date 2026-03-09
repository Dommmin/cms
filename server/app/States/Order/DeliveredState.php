<?php

declare(strict_types=1);

namespace App\States\Order;

class DeliveredState extends OrderState
{
    public static string $name = 'delivered';
}
