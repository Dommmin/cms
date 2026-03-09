<?php

declare(strict_types=1);

namespace App\Enums;

enum NotificationStatusEnum: string
{
    case Pending = 'pending';
    case Sent = 'sent';
    case Failed = 'failed';
    case Delivered = 'delivered';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'W queue',
            self::Sent => 'Wysłana',
            self::Failed => 'Nieudana',
            self::Delivered => 'Dostarczono',
        };
    }
}
