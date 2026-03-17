<?php

declare(strict_types=1);

namespace App\Infrastructure\Shipping\InPost;

use App\Enums\ShipmentStatusEnum;
use App\Interfaces\ShippingCarrierInterface;
use App\Models\Order;
use App\Models\Shipment;
use RuntimeException;

/**
 * InPost Paczkomat — bezpośrednia integracja przez ShipX API.
 * Wymaga pickup_point_id (np. "KRA010M") ustawionego na Shipment.
 */
class InPostLockerCarrier implements ShippingCarrierInterface
{
    public function __construct(
        private readonly InPostClient $client
    ) {}

    public function createShipment(Order $order, array $data = []): Shipment
    {
        $shipment = $order->shipment ?? throw new RuntimeException('Order has no shipment record.');

        $targetPoint = $shipment->pickup_point_id
            ?? throw new RuntimeException('InPost Paczkomat requires a pickup_point_id (paczkomat name).');

        $address = $order->shippingAddress ?? $order->billingAddress;
        $customer = $order->customer;

        $payload = [
            'receiver' => [
                'name' => trim(($address?->first_name ?? '').' '.($address?->last_name ?? '')),
                'company_name' => $address?->company_name,
                'email' => $customer?->email ?? '',
                'phone' => $address?->phone ?? '',
                'address' => [
                    'street' => $address?->street ?? '',
                    'building_number' => '',
                    'city' => $address?->city ?? '',
                    'post_code' => $address?->postal_code ?? '',
                    'country_code' => $address?->country_code ?? 'PL',
                ],
            ],
            'sender' => [
                'name' => config('services.furgonetka.sender_name', config('app.name')),
                'email' => config('services.furgonetka.sender_email'),
                'phone' => config('services.furgonetka.sender_phone'),
                'address' => [
                    'street' => config('services.furgonetka.sender_street'),
                    'city' => config('services.furgonetka.sender_city'),
                    'post_code' => config('services.furgonetka.sender_postal_code'),
                    'country_code' => config('services.furgonetka.sender_country_code', 'PL'),
                ],
            ],
            'custom_attributes' => [
                'target_point' => $targetPoint,
            ],
            'service' => 'inpost_locker_standard',
            'reference' => $order->reference_number,
            'comments' => $order->notes ?? '',
            'parcels' => [
                [
                    'template' => $data['parcel_template'] ?? 'small', // small|medium|large
                    'weight' => ['amount' => max(0.1, (float) ($data['weight_kg'] ?? 1.0)), 'unit' => 'kg'],
                ],
            ],
        ];

        $response = $this->client->createShipment($payload);

        $shipmentId = (string) ($response['id'] ?? '');
        $trackingNumber = (string) ($response['tracking_number'] ?? '');

        $shipment->update([
            'provider_shipment_id' => $shipmentId,
            'tracking_number' => $trackingNumber ?: null,
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

        if ($url) {
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

        $response = $this->client->getShipment($shipmentId);

        $status = $this->mapStatus($response['status'] ?? '');
        if ($status && $shipment->status !== $status) {
            $shipment->update(['status' => $status->value]);
        }

        return $response;
    }

    public function handleWebhook(array $payload): void
    {
        $shipmentId = (string) ($payload['shipment']['id'] ?? $payload['id'] ?? '');

        if (! $shipmentId) {
            return;
        }

        /** @var Shipment|null $shipment */
        $shipment = Shipment::query()->where('provider_shipment_id', $shipmentId)->first();

        if (! $shipment) {
            return;
        }

        $status = $this->mapStatus($payload['shipment']['status'] ?? $payload['status'] ?? '');
        if ($status) {
            $shipment->update(['status' => $status->value]);
        }
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private function mapStatus(string $inpostStatus): ?ShipmentStatusEnum
    {
        return match (strtolower($inpostStatus)) {
            'created', 'offers_prepared', 'offer_selected', 'confirmed',
            'prepared', 'dispatched_by_sender' => ShipmentStatusEnum::LABEL_CREATED,
            'collected_from_sender' => ShipmentStatusEnum::PICKED_UP,
            'taken_by_courier', 'adopted_at_source_branch',
            'in_transit', 'adopted_at_sorting_center' => ShipmentStatusEnum::IN_TRANSIT,
            'out_for_delivery', 'adopted_at_target_branch' => ShipmentStatusEnum::OUT_FOR_DELIVERY,
            'delivered', 'stored_in_locker', 'pickup_reminder_sent',
            'avizo', 'ready_to_pickup' => ShipmentStatusEnum::DELIVERED,
            'returned_to_sender', 'canceled', 'rejected_by_receiver' => ShipmentStatusEnum::RETURNED,
            'undelivered' => ShipmentStatusEnum::FAILED,
            default => null,
        };
    }
}
