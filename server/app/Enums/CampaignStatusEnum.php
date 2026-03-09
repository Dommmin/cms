<?php

declare(strict_types=1);

namespace App\Enums;

enum CampaignStatusEnum: string
{
    case Draft = 'draft';
    case Ready = 'ready';
    case Scheduled = 'scheduled';
    case Sending = 'sending';
    case Sent = 'sent';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Robota',
            self::Ready => 'Gotowa',
            self::Scheduled => 'Zaplanowana',
            self::Sending => 'Wysyłanie',
            self::Sent => 'Wysłana',
            self::Cancelled => 'Anulowana',
        };
    }
}
