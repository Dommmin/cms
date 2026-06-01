<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\OrderPaid;
use App\Services\GA4MeasurementProtocolService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Attributes\Queue;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\InteractsWithQueue;

/**
 * Track a purchase event in GA4 via Measurement Protocol after order payment.
 *
 * Runs asynchronously on the 'default' queue so the payment webhook response
 * is never delayed by a slow external HTTP call.
 */
#[Queue('default')]
#[Tries(2)]
final class TrackPurchaseInGA4 implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        private readonly GA4MeasurementProtocolService $ga4,
    ) {}

    public function handle(OrderPaid $event): void
    {
        if (! $this->ga4->isConfigured()) {
            return;
        }

        $order = $event->order->loadMissing('items');

        // ga_client_id is stored on the order at checkout time (from the _ga cookie)
        $this->ga4->trackPurchase($order, $order->ga_client_id);
    }
}
