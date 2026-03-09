<?php

declare(strict_types=1);

namespace App\Enums;

enum ReviewStatusEnum: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Spam = 'spam';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Oczekująca',
            self::Approved => 'Zatwierdzona',
            self::Rejected => 'Odrzucona',
            self::Spam => 'Spam',
        };
    }
}
