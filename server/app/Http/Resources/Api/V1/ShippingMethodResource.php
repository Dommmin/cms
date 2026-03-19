<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\ShippingMethod;
use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ShippingMethod
 */
class ShippingMethodResource extends JsonResource
{
    /** Maps env variable name → Laravel config key used to check if it is set. */
    private const array ENV_TO_CONFIG = [
        'INPOST_GEOWIDGET_TOKEN' => 'services.inpost_shipx.geowidget_token',
        'FURGONETKA_CLIENT_ID' => 'services.furgonetka.client_id',
        'FURGONETKA_CLIENT_SECRET' => 'services.furgonetka.client_secret',
    ];

    public function toArray(Request $request): array
    {
        /** @var ShippingMethod $method */
        $method = $this->resource;

        $locale = $request->query('locale', app()->getLocale());

        $missingConfig = [];
        if ($method->carrier instanceof \App\Enums\ShippingCarrierEnum) {
            foreach ($method->carrier->checkoutEnvVars() as $envVar) {
                if (empty(config(self::ENV_TO_CONFIG[$envVar] ?? ''))) {
                    $missingConfig[] = $envVar;
                }
            }
        }

        return [
            'id' => $method->id,
            'name' => $method->getTranslation('name', $locale, useFallbackLocale: true),
            'description' => $method->getTranslation('description', $locale, useFallbackLocale: true),
            'carrier' => $method->carrier instanceof BackedEnum ? $method->carrier->value : $method->carrier,
            'base_price' => $method->base_price,
            'free_shipping_threshold' => $method->free_shipping_threshold,
            'estimated_days_min' => $method->estimated_days_min,
            'estimated_days_max' => $method->estimated_days_max,
            'requires_pickup_point' => $method->requiresPickupPoint(),
            'uses_native_widget' => $method->carrier instanceof \App\Enums\ShippingCarrierEnum && $method->carrier->usesNativeWidget(),
            'configured' => $missingConfig === [],
            'missing_config' => $missingConfig,
        ];
    }
}
