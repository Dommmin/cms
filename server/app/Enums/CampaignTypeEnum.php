<?php

declare(strict_types=1);

namespace App\Enums;

enum CampaignTypeEnum: string
{
    case Broadcast = 'broadcast';
    case Automated = 'automated';
    case Scheduled = 'scheduled';

    public function label(): string
    {
        return match ($this) {
            self::Broadcast => 'Jednorazowa',
            self::Automated => 'Automatyczna',
            self::Scheduled => 'Zaplanowana',
        };
    }
}
