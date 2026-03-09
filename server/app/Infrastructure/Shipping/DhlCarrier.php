<?php

declare(strict_types=1);

namespace App\Infrastructure\Shipping;

use App\Models\Order;
use App\Models\Shipment;
use App\Modules\Ecommerce\Domain\Interfaces\ShippingCarrierInterface;

class DhlCarrier implements ShippingCarrierInterface
{
    public function createShipment(Order $order, array $data): Shipment
    {
        return $order->shipment()->firstOrFail();
    }

    public function generateLabel(Shipment $shipment): string
    {
        return '';
    }

    public function trackShipment(Shipment $shipment): array
    {
        return [];
    }

    public function handleWebhook(array $payload): void
    {
        // Stub: to be implemented
    }
}
