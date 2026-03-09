<?php

declare(strict_types=1);

namespace App\Enums;

enum SupportChannelEnum: string
{
    case WIDGET = 'widget';
    case EMAIL = 'email';

    public function getLabel(): string
    {
        return match ($this) {
            self::WIDGET => 'Chat',
            self::EMAIL => 'Email',
        };
    }
}
