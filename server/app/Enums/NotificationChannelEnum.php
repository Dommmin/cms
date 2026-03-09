<?php

declare(strict_types=1);

namespace App\Enums;

enum NotificationChannelEnum: string
{
    case Email = 'email';
    case Sms = 'sms';
    case Push = 'push';

    public function label(): string
    {
        return match ($this) {
            self::Email => 'Email',
            self::Sms => 'SMS',
            self::Push => 'Push',
        };
    }
}
