<?php

declare(strict_types=1);

namespace App\Enums;

enum ShipmentStatusEnum: string
{
    case PENDING = 'pending';
    case LABEL_CREATED = 'label_created';
    case PICKED_UP = 'picked_up';
    case IN_TRANSIT = 'in_transit';
    case OUT_FOR_DELIVERY = 'out_for_delivery';
    case DELIVERED = 'delivered';
    case FAILED = 'failed';
    case RETURNED = 'returned';

    public function getLabel(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::LABEL_CREATED => 'Label created',
            self::PICKED_UP => 'Picked up',
            self::IN_TRANSIT => 'In transit',
            self::OUT_FOR_DELIVERY => 'Out for delivery',
            self::DELIVERED => 'Delivered',
            self::FAILED => 'Failed',
            self::RETURNED => 'Returned',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::PENDING => 'gray',
            self::LABEL_CREATED => 'yellow',
            self::PICKED_UP => 'green',
            self::IN_TRANSIT => 'blue',
            self::OUT_FOR_DELIVERY => 'indigo',
            self::DELIVERED => 'purple',
            self::FAILED => 'red',
            self::RETURNED => 'orange',
        };
    }
}
