<?php

declare(strict_types=1);

namespace App\Interfaces;

use App\Models\Order;
use App\Models\Shipment;

/**
 * Shipping Carrier Interface
 * All shipping carriers must implement this interface
 */
interface ShippingCarrierInterface
{
    /**
     * Create a shipment for an order
     */
    public function createShipment(Order $order, array $data): Shipment;

    /**
     * Generate shipping label
     */
    public function generateLabel(Shipment $shipment): string;

    /**
     * Track shipment status
     */
    public function trackShipment(Shipment $shipment): array;

    /**
     * Handle webhook from shipping carrier (optional)
     */
    public function handleWebhook(array $payload): void;
}
