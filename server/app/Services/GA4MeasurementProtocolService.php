<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * GA4 Measurement Protocol Service
 *
 * Sends server-side ecommerce events to Google Analytics 4 bypassing
 * ad-blockers and browser-level tracking prevention (ITP, Safari).
 *
 * Requires:
 *   services.ga4.measurement_id  — the GA4 Measurement ID (G-XXXXXXXXXX)
 *   services.ga4.api_secret      — the Measurement Protocol API secret
 */
final readonly class GA4MeasurementProtocolService
{
    private const string API_URL = 'https://www.google-analytics.com/mp/collect';

    public function __construct(
        private string $measurementId = '',
        private string $apiSecret = '',
    ) {}

    public function isConfigured(): bool
    {
        return $this->measurementId !== '' && $this->apiSecret !== '';
    }

    /**
     * Track a purchase event server-side after payment confirmation.
     *
     * @param  string|null  $clientId  GA4 client_id extracted from the _ga cookie on the frontend.
     */
    public function trackPurchase(Order $order, ?string $clientId = null): void
    {
        if (! $this->isConfigured()) {
            return;
        }

        $payload = [
            'client_id' => $clientId ?? $this->fallbackClientId($order),
            'events' => [
                [
                    'name' => 'purchase',
                    'params' => [
                        'transaction_id' => $order->reference_number,
                        'value' => round($order->total / 100, 2),
                        'tax' => round(($order->tax_amount ?? 0) / 100, 2),
                        'shipping' => round(($order->shipping_cost ?? 0) / 100, 2),
                        'currency' => $order->currency_code ?? 'PLN',
                        'items' => $this->mapItems($order),
                    ],
                ],
            ],
        ];

        Http::timeout(5)
            ->post($this->apiUrl(), $payload)
            ->onError(function () use ($order): void {
                Log::warning('GA4 Measurement Protocol: purchase event failed', [
                    'order_id' => $order->id,
                    'reference' => $order->reference_number,
                ]);
            });
    }

    private function apiUrl(): string
    {
        return self::API_URL
            .'?measurement_id='.urlencode($this->measurementId)
            .'&api_secret='.urlencode($this->apiSecret);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function mapItems(Order $order): array
    {
        return $order->items->map(fn ($item, int $index): array => [
            'item_id' => (string) $item->product_id,
            'item_name' => (string) $item->product_name,
            'item_variant' => $item->variant_id ? (string) $item->variant_id : null,
            'price' => round($item->unit_price / 100, 2),
            'quantity' => (int) $item->quantity,
            'index' => $index,
        ])->all();
    }

    /**
     * Deterministic fallback when no _ga cookie was sent with the checkout.
     * Not ideal for cross-device accuracy but prevents missing the event entirely.
     */
    private function fallbackClientId(Order $order): string
    {
        return sprintf('%d.%d', (int) $order->customer_id, $order->created_at->timestamp);
    }
}
