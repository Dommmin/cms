<?php

declare(strict_types=1);

namespace App\Enums;

enum ShippingCarrierEnum: string
{
    case INPOST = 'inpost';
    case DPD = 'dpd';
    case DHL = 'dhl';
    case PICKUP = 'pickup';

    public function getLabel(): string
    {
        return match ($this) {
            self::INPOST => 'InPost',
            self::DPD => 'DPD',
            self::DHL => 'DHL',
            self::PICKUP => 'Odbiór osobisty',
        };
    }
}
