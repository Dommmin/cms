<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Modules\Ecommerce\Domain\Events\OrderCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

/**
 * Send Order Confirmation Email Listener
 * TODO: Implement when Mail system is ready
 */
final class SendOrderConfirmationEmail implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(OrderCreated $event): void
    {
        // TODO: Send order confirmation email
        // Mail::to($event->order->customer->email)
        //     ->queue(new OrderConfirmation($event->order));
    }
}

