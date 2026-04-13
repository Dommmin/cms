<?php

declare(strict_types=1);

namespace App\Enums;

enum SubscriptionStatusEnum: string
{
    case Active = 'active';
    case Trial = 'trial';
    case Paused = 'paused';
    case Cancelled = 'cancelled';
    case Expired = 'expired';
    case Pending = 'pending';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Aktywna',
            self::Trial => 'Okres próbny',
            self::Paused => 'Wstrzymana',
            self::Cancelled => 'Anulowana',
            self::Expired => 'Wygasła',
            self::Pending => 'Oczekująca',
        };
    }

    public function isActive(): bool
    {
        return in_array($this, [self::Active, self::Trial]);
    }
}
