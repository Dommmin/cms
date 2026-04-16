<?php

declare(strict_types=1);

namespace App\Enums;

enum OrderStatusEnum: string
{
    case DRAFT = 'draft';
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
            self::DRAFT => 'Szkic',
            self::PENDING => 'Oczekujące',
            self::AWAITING => 'Oczekuje na płatność',
            self::PAID => 'Opłacone',
            self::PROCESSING => 'W realizacji',
            self::SHIPPED => 'Wysłane',
            self::DELIVERED => 'Dostarczone',
            self::CANCELLED => 'Anulowane',
            self::REFUNDED => 'Zwrócone',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::DRAFT => 'slate',
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
