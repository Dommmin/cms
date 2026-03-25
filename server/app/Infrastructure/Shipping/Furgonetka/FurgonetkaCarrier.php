<?php

declare(strict_types=1);

namespace App\Infrastructure\Shipping\Furgonetka;

use App\Enums\ShipmentStatusEnum;
use App\Interfaces\ShippingCarrierInterface;
use App\Models\Order;
use App\Models\Shipment;
use RuntimeException;

/**
 * Adapter Furgonetka dla jednego przewoźnika (DPD, DHL, GLS, InPost kurier).
 * Instancja tworzona z konkretnym kodem usługi, np. 'dpd_classic'.
 */
class FurgonetkaCarrier implements ShippingCarrierInterface
{
    public function __construct(
        private readonly FurgonetkaClient $client,
        private readonly string $serviceCode
    ) {}

    public function createShipment(Order $order, array $data = []): Shipment
    {
        $shipment = $order->shipment ?? throw new RuntimeException('Order has no shipment record.');

        $address = $order->shippingAddress ?? $order->billingAddress;

        $payload = [
            'service' => $this->serviceCode,
            'sender' => $this->buildSender(),
            'receiver' => [
                'name' => mb_trim(($address?->first_name ?? '').' '.($address?->last_name ?? '')),
                'company' => $address?->company_name,
                'email' => $order->customer?->email ?? '',
                'phone' => $address?->phone ?? '',
                'street' => $address?->street ?? '',
                'city' => $address?->city ?? '',
                'postal_code' => $address?->postal_code ?? '',
                'country_code' => $address?->country_code ?? 'PL',
            ],
            'parcels' => [
                [
                    'weight' => max(0.1, (float) ($data['weight_kg'] ?? 1.0)),
                    'width' => (int) ($data['width_cm'] ?? 20),
                    'height' => (int) ($data['height_cm'] ?? 15),
                    'depth' => (int) ($data['depth_cm'] ?? 10),
                ],
            ],
            'reference' => $order->reference_number,
            'comment' => $order->notes ?? '',
        ];

        $response = $this->client->createShipment($payload);

        $shipmentId = (string) ($response['id'] ?? $response['shipment_id'] ?? '');
        $trackingNumber = (string) ($response['tracking_number'] ?? $response['waybill'] ?? '');
        $labelUrl = $response['label_url'] ?? null;

        $shipment->update([
            'provider_shipment_id' => $shipmentId,
            'tracking_number' => $trackingNumber ?: null,
            'label_url' => $labelUrl,
            'status' => ShipmentStatusEnum::LABEL_CREATED->value,
            'carrier_payload' => $response,
        ]);

        return $shipment->fresh();
    }

    public function generateLabel(Shipment $shipment): string
    {
        if ($shipment->label_url) {
            return $shipment->label_url;
        }

        $shipmentId = $shipment->provider_shipment_id
            ?? throw new RuntimeException('No provider shipment ID stored.');

        $response = $this->client->getLabel($shipmentId);

        $url = (string) ($response['url'] ?? $response['label_url'] ?? '');

        if ($url !== '' && $url !== '0') {
            $shipment->update(['label_url' => $url]);
        }

        return $url;
    }

    public function trackShipment(Shipment $shipment): array
    {
        $shipmentId = $shipment->provider_shipment_id;

        if (! $shipmentId) {
            return ['status' => $shipment->status->value, 'events' => []];
        }

        $response = $this->client->getTracking($shipmentId);

        $status = $this->mapStatus($response['status'] ?? '');
        if ($status && $shipment->status !== $status) {
            $shipment->update(['status' => $status->value]);
        }

        return $response;
    }

    public function handleWebhook(array $payload): void
    {
        $shipmentId = (string) ($payload['shipment_id'] ?? $payload['id'] ?? '');

        if ($shipmentId === '' || $shipmentId === '0') {
            return;
        }

        /** @var Shipment|null $shipment */
        $shipment = Shipment::query()->where('provider_shipment_id', $shipmentId)->first();

        if (! $shipment) {
            return;
        }

        $status = $this->mapStatus($payload['status'] ?? '');
        if ($status instanceof ShipmentStatusEnum) {
            $shipment->update(['status' => $status->value]);
        }

        if (! empty($payload['tracking_number'])) {
            $shipment->update(['tracking_number' => $payload['tracking_number']]);
        }
    }

    // ── Private helpers ────────────────────────────────────────────────────

    /**
     * @return array<string, mixed>
     */
    private function buildSender(): array
    {
        return [
            'name' => config('services.furgonetka.sender_name', config('app.name')),
            'email' => config('services.furgonetka.sender_email'),
            'phone' => config('services.furgonetka.sender_phone'),
            'street' => config('services.furgonetka.sender_street'),
            'city' => config('services.furgonetka.sender_city'),
            'postal_code' => config('services.furgonetka.sender_postal_code'),
            'country_code' => config('services.furgonetka.sender_country_code', 'PL'),
        ];
    }

    private function mapStatus(string $furgonetkaStatus): ?ShipmentStatusEnum
    {
        return match (mb_strtolower($furgonetkaStatus)) {
            'new', 'created', 'label_created' => ShipmentStatusEnum::LABEL_CREATED,
            'picked_up', 'collected' => ShipmentStatusEnum::PICKED_UP,
            'in_transit', 'transit' => ShipmentStatusEnum::IN_TRANSIT,
            'out_for_delivery', 'delivering' => ShipmentStatusEnum::OUT_FOR_DELIVERY,
            'delivered', 'delivered_to_point' => ShipmentStatusEnum::DELIVERED,
            'failed', 'undelivered', 'returned_to_sender' => ShipmentStatusEnum::FAILED,
            'returned' => ShipmentStatusEnum::RETURNED,
            default => null,
        };
    }
}
