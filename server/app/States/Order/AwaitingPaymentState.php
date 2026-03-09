<?php

declare(strict_types=1);

namespace App\States\Order;

class AwaitingPaymentState extends OrderState
{
    public static string $name = 'awaiting_payment';
}
