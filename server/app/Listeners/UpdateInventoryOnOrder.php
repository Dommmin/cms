<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\OrderCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

/**
 * Update Inventory on Order Listener
 * Decrements stock when order is created
 */
class UpdateInventoryOnOrder implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(OrderCreated $event): void
    {
        // Stock is already decremented in OrderService
        // This listener can be used for additional inventory operations
        // like logging, notifications, etc.
    }
}
