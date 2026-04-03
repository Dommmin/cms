<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ShipmentStatusEnum;
use App\Enums\ShippingCarrierEnum;
use App\Models\Shipment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Shipment>
 */
class ShipmentFactory extends Factory
{
    protected $model = Shipment::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'carrier' => ShippingCarrierEnum::PICKUP->value,
            'status' => ShipmentStatusEnum::PENDING->value,
        ];
    }
}
