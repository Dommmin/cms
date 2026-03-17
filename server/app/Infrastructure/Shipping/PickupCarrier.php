<?php

declare(strict_types=1);

namespace App\Infrastructure\Shipping;

use App\Interfaces\ShippingCarrierInterface;
use App\Models\Order;
use App\Models\Shipment;

/**
 * Odbiór osobisty — brak faktycznej wysyłki.
 * Shipment jest tworzony w bazie przez CheckoutService;
 * ten carrier nie komunikuje się z żadnym zewnętrznym API.
 */
class PickupCarrier implements ShippingCarrierInterface
{
    public function createShipment(Order $order, array $data = []): Shipment
    {
        return $order->shipment ?? $order->shipment()->firstOrFail();
    }

    public function generateLabel(Shipment $shipment): string
    {
        return '';
    }

    public function trackShipment(Shipment $shipment): array
    {
        return ['status' => $shipment->status->value, 'events' => []];
    }

    public function handleWebhook(array $payload): void
    {
        // Odbiór osobisty nie używa webhooków
    }
}
