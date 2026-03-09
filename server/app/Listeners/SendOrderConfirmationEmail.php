<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Notifications\OrderConfirmedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendOrderConfirmationEmail implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(OrderCreated $event): void
    {
        $order = $event->order;
        $customer = $order->customer;

        if (! $customer) {
            return;
        }

        $user = $customer->user;

        if (! $user) {
            return;
        }

        $user->notify(new OrderConfirmedNotification($order));
    }
}
