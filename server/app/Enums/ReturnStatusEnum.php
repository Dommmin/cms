<?php

declare(strict_types=1);

namespace App\Enums;

enum ReturnStatusEnum: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case ReturnLabelSent = 'return_label_sent';
    case AwaitingReturn = 'awaiting_return';
    case Received = 'received';
    case Inspected = 'inspected';
    case Refunded = 'refunded';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Oczekujący',
            self::Approved => 'Zaakceptowany',
            self::Rejected => 'Odrzucony',
            self::ReturnLabelSent => 'Etykieta zwrotu wysłana',
            self::AwaitingReturn => 'Czeka na przesyłkę',
            self::Received => 'Otrzymano',
            self::Inspected => 'Po inspekcji',
            self::Refunded => 'Zwrócono pieniądze',
            self::Closed => 'Zamknięty',
        };
    }

    public function isActive(): bool
    {
        return in_array($this, [self::Pending, self::Approved, self::ReturnLabelSent, self::AwaitingReturn]);
    }
}
