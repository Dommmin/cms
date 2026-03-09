<?php

declare(strict_types=1);

namespace App\States\Order;

class PaidState extends OrderState
{
    public static string $name = 'paid';
}
