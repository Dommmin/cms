<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\PaymentProviderEnum;
use App\Interfaces\PaymentGatewayInterface;
use InvalidArgumentException;

class PaymentGatewayManager
{
    /**
     * @param  array<string, PaymentGatewayInterface>  $gateways
     */
    public function __construct(
        private readonly array $gateways
    ) {}

    public function driver(PaymentProviderEnum $provider): PaymentGatewayInterface
    {
        $key = $provider->value;

        if (! array_key_exists($key, $this->gateways)) {
            throw new InvalidArgumentException(sprintf('Payment gateway "%s" is not registered.', $key));
        }

        return $this->gateways[$key];
    }
}
