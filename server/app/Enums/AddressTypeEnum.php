<?php

declare(strict_types=1);

namespace App\Enums;

enum AddressTypeEnum: string
{
    case BILLING = 'billing';
    case SHIPPING = 'shipping';
    case BOTH = 'both';

    public function getLabel(): string
    {
        return match ($this) {
            self::BILLING => 'Billing',
            self::SHIPPING => 'Shipping',
            self::BOTH => 'Both',
        };
    }
}
