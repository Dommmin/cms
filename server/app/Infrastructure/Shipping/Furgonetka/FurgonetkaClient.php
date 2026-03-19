<?php

declare(strict_types=1);

namespace App\Infrastructure\Shipping\Furgonetka;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class FurgonetkaClient
{
    public function __construct(
        private readonly FurgonetkaTokenService $tokenService
    ) {}

    /**
     * Create a shipment.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function createShipment(array $data): array
    {
        return $this->request('POST', '/v1/shipments', $data);
    }

    /**
     * Get shipment label URL (PDF).
     *
     * @return array<string, mixed>
     */
    public function getLabel(string $shipmentId): array
    {
        return $this->request('GET', "/v1/shipments/{$shipmentId}/label");
    }

    /**
     * Get shipment tracking info.
     *
     * @return array<string, mixed>
     */
    public function getTracking(string $shipmentId): array
    {
        return $this->request('GET', "/v1/shipments/{$shipmentId}/tracking");
    }

    /**
     * Get pickup points for a given service near a postal code / coordinates.
     *
     * @return array<string, mixed>
     */
    public function getPickupPoints(string $serviceCode, ?string $postalCode = null, ?float $lat = null, ?float $lng = null): array
    {
        $params = array_filter([
            'service' => $serviceCode,
            'zip' => $postalCode,
            'latitude' => $lat,
            'longitude' => $lng,
            'country' => 'PL',
            'limit' => 30,
        ]);

        return $this->request('GET', '/v2/points', $params);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function request(string $method, string $path, array $data = []): array
    {
        $response = $this->send($method, $path, $data);

        if ($response->status() === 401) {
            $this->tokenService->invalidate();
            $response = $this->send($method, $path, $data);
        }

        if (! $response->successful()) {
            throw new RuntimeException("Furgonetka API error [{$response->status()}]: ".$response->body());
        }

        return $response->json() ?? [];
    }

    private function send(string $method, string $path, array $data): \Illuminate\Http\Client\Response
    {
        $baseUrl = config('services.furgonetka.base_url');
        $token = $this->tokenService->getToken();

        $client = Http::withToken($token)->acceptJson();

        return match (mb_strtoupper($method)) {
            'POST' => $client->post($baseUrl.$path, $data),
            'GET' => $client->get($baseUrl.$path, $data),   // $data as query params
            default => throw new RuntimeException("Unsupported method: {$method}"),
        };
    }
}
