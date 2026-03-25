<?php

declare(strict_types=1);

namespace App\Infrastructure\Shipping\InPost;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class InPostClient
{
    /**
     * Create a paczkomat shipment.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function createShipment(array $data): array
    {
        $orgId = $this->organizationId();
        $response = $this->client()->post(
            $this->baseUrl().sprintf('/organizations/%s/shipments', $orgId),
            $data
        );

        if (! $response->successful()) {
            throw new RuntimeException(sprintf('InPost ShipX error [%d]: ', $response->status()).$response->body());
        }

        return $response->json() ?? [];
    }

    /**
     * Get shipment details.
     *
     * @return array<string, mixed>
     */
    public function getShipment(string $shipmentId): array
    {
        $response = $this->client()->get($this->baseUrl().('/shipments/'.$shipmentId));

        if (! $response->successful()) {
            throw new RuntimeException(sprintf('InPost ShipX error [%d]: ', $response->status()).$response->body());
        }

        return $response->json() ?? [];
    }

    /**
     * Get shipment label (PDF/ZPL).
     *
     * @return array<string, mixed>
     */
    public function getLabel(string $shipmentId, string $format = 'pdf'): array
    {
        $orgId = $this->organizationId();
        $response = $this->client()->get(
            $this->baseUrl().sprintf('/organizations/%s/shipments/labels', $orgId),
            ['shipment_ids' => [$shipmentId], 'format' => $format]
        );

        if (! $response->successful()) {
            throw new RuntimeException(sprintf('InPost label error [%d]: ', $response->status()).$response->body());
        }

        return $response->json() ?? [];
    }

    private function baseUrl(): string
    {
        return mb_rtrim((string) config('services.inpost_shipx.base_url'), '/');
    }

    private function client(): PendingRequest
    {
        return Http::withToken((string) config('services.inpost_shipx.token'))
            ->acceptJson();
    }

    private function organizationId(): string
    {
        return (string) config('services.inpost_shipx.organization_id');
    }
}
