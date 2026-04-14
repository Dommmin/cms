<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\PaymentProviderEnum;
use App\Interfaces\PaymentGatewayInterface;
use InvalidArgumentException;

class PaymentService
{
    public function __construct(
        private readonly PaymentGatewayManager $gatewayManager
    ) {}

    public function getGateway(string $provider): ?PaymentGatewayInterface
    {
        try {
            return $this->gatewayManager->driver(PaymentProviderEnum::from($provider));
        } catch (InvalidArgumentException) {
            return null;
        }
    }
}
