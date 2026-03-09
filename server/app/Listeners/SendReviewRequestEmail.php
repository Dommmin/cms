<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\OrderDelivered;
use App\Notifications\ReviewRequestNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendReviewRequestEmail implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(OrderDelivered $event): void
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

        $user->notify(new ReviewRequestNotification($order));
    }
}
