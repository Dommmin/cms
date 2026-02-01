<?php

declare(strict_types=1);

namespace App\Enums;

enum PaymentStatusEnum: string
{
    case PENDING = 'pending';
    case AUTHORIZED = 'authorized';
    case COMPLETED = 'completed';
    case FAILED = 'failed';
    case REFUNDED = 'refunded';
    case PARTIALLY_REFUNDED = 'partially_refunded';

    public function getLabel(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::AUTHORIZED => 'Authorized',
            self::COMPLETED => 'Completed',
            self::FAILED => 'Failed',
            self::REFUNDED => 'Refunded',
            self::PARTIALLY_REFUNDED => 'Partially refunded',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::PENDING => 'gray',
            self::AUTHORIZED => 'yellow',
            self::COMPLETED => 'green',
            self::FAILED => 'red',
            self::REFUNDED => 'orange',
            self::PARTIALLY_REFUNDED => 'amber',
        };
    }
}
