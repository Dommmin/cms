<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\ShippingCarrierEnum;
use App\Modules\Ecommerce\Domain\Interfaces\ShippingCarrierInterface;
use InvalidArgumentException;

class ShippingCarrierManager
{
    /**
     * @param  array<string, ShippingCarrierInterface>  $carriers
     */
    public function __construct(
        private readonly array $carriers
    ) {}

    public function driver(ShippingCarrierEnum $carrier): ShippingCarrierInterface
    {
        $key = $carrier->value;

        if (! array_key_exists($key, $this->carriers)) {
            throw new InvalidArgumentException(sprintf('Shipping carrier "%s" is not registered.', $key));
        }

        return $this->carriers[$key];
    }
}
