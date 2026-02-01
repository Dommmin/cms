<?php

declare(strict_types=1);

namespace App\Enums;

enum OrderStatusEnum: string
{
    case PENDING = 'pending';
    case AWAITING = 'awaiting_payment';
    case PAID = 'paid';
    case PROCESSING = 'processing';
    case SHIPPED = 'shipped';
    case DELIVERED = 'delivered';
    case CANCELLED = 'cancelled';
    case REFUNDED = 'refunded';

    public function getLabel(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::AWAITING => 'Awaiting payment',
            self::PAID => 'Paid',
            self::PROCESSING => 'Processing',
            self::SHIPPED => 'Shipped',
            self::DELIVERED => 'Delivered',
            self::CANCELLED => 'Cancelled',
            self::REFUNDED => 'Refunded',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::PENDING => 'gray',
            self::AWAITING => 'yellow',
            self::PAID => 'green',
            self::PROCESSING => 'blue',
            self::SHIPPED => 'indigo',
            self::DELIVERED => 'purple',
            self::CANCELLED => 'red',
            self::REFUNDED => 'orange',
        };
    }
}
