<?php

declare(strict_types=1);

/**
 * @deprecated Use App\Infrastructure\Shipping\Furgonetka\FurgonetkaCarrier('inpost_kurier')
 *             or App\Infrastructure\Shipping\InPost\InPostLockerCarrier for paczkomaty.
 */

namespace App\Infrastructure\Shipping;

use App\Infrastructure\Shipping\Furgonetka\FurgonetkaCarrier;
use App\Interfaces\ShippingCarrierInterface;
use App\Models\Order;
use App\Models\Shipment;

/** @codeCoverageIgnore */
class InpostCarrier implements ShippingCarrierInterface
{
    public function __construct(private readonly FurgonetkaCarrier $delegate) {}

    public function createShipment(Order $order, array $data = []): Shipment
    {
        return $this->delegate->createShipment($order, $data);
    }

    public function generateLabel(Shipment $shipment): string
    {
        return $this->delegate->generateLabel($shipment);
    }

    public function trackShipment(Shipment $shipment): array
    {
        return $this->delegate->trackShipment($shipment);
    }

    public function handleWebhook(array $payload): void
    {
        $this->delegate->handleWebhook($payload);
    }
}
