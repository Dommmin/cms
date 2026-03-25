<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\ShippingCarrierEnum;
use App\Http\Controllers\Controller;
use App\Infrastructure\Shipping\Furgonetka\FurgonetkaClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class PickupPointsController extends Controller
{
    public function __construct(private readonly FurgonetkaClient $client) {}

    /**
     * Return pickup points for a carrier near a given postal code / coordinates.
     * Used by the frontend Leaflet picker for DPD Pickup, DHL ServicePoint etc.
     *
     * GET /api/v1/checkout/pickup-points?carrier=dpd_pickup&postal_code=30-001
     */
    public function index(Request $request): JsonResponse
    {
        $carrier = ShippingCarrierEnum::tryFrom((string) $request->query('carrier', ''));

        // Only Furgonetka-based pickup carriers are handled here.
        // INPOST_LOCKER uses the native InPost geowidget — no backend call needed.
        if (! $carrier || ! $carrier->requiresPickupPoint() || $carrier->usesNativeWidget()) {
            return response()->json(['data' => []]);
        }

        $serviceCode = $carrier->furgonetkaServiceCode();
        if ($serviceCode === null) {
            return response()->json(['data' => []]);
        }

        // Guard: Furgonetka credentials must be set in server/.env
        if (empty(config('services.furgonetka.client_id')) || empty(config('services.furgonetka.client_secret'))) {
            return response()->json([
                'data' => [],
                'configured' => false,
                'missing_env' => ['FURGONETKA_CLIENT_ID', 'FURGONETKA_CLIENT_SECRET'],
            ]);
        }

        $postalCode = (string) $request->query('postal_code', '');
        $lat = $request->query('lat') ? (float) $request->query('lat') : null;
        $lng = $request->query('lng') ? (float) $request->query('lng') : null;

        // Need at least postal code or coordinates
        if (! $postalCode && ($lat === null || $lng === null)) {
            return response()->json(['data' => []]);
        }

        try {
            $raw = $this->client->getPickupPoints(
                serviceCode: $serviceCode,
                postalCode: $postalCode ?: null,
                lat: $lat,
                lng: $lng,
            );
        } catch (Throwable) {
            return response()->json(['data' => []]);
        }

        return response()->json(['data' => $this->normalize($raw), 'configured' => true, 'missing_env' => []]);
    }

    /**
     * Normalize Furgonetka point response to a flat structure.
     * Handles multiple possible response shapes from their API.
     *
     * @param  array<string, mixed>  $raw
     * @return array<int, array<string, mixed>>
     */
    private function normalize(array $raw): array
    {
        $items = $raw['items'] ?? $raw['data'] ?? $raw;

        if (! is_array($items)) {
            return [];
        }

        return collect($items)
            ->map(function (mixed $p): array {
                if (! is_array($p)) {
                    return [];
                }

                $street = $p['address']['street'] ?? $p['street'] ?? '';
                $city = $p['address']['city'] ?? $p['city'] ?? '';
                $zip = $p['address']['zip'] ?? $p['zip'] ?? '';
                $address = mb_trim(implode(', ', array_filter([$street, $zip ? sprintf('%s %s', $zip, $city) : $city])));

                return [
                    'id' => (string) ($p['code'] ?? $p['id'] ?? ''),
                    'name' => (string) ($p['name'] ?? $p['code'] ?? ''),
                    'address' => $address,
                    'hours' => $p['opening_hours'] ?? $p['hours'] ?? null,
                    'lat' => (float) ($p['location']['latitude'] ?? $p['latitude'] ?? 0),
                    'lng' => (float) ($p['location']['longitude'] ?? $p['longitude'] ?? 0),
                ];
            })
            ->filter(fn (array $p): bool => $p['id'] !== '' && ($p['lat'] !== 0.0 || $p['lng'] !== 0.0))
            ->values()
            ->all();
    }
}
