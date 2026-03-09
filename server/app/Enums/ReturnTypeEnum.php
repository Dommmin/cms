<?php

declare(strict_types=1);

namespace App\Enums;

enum ReturnTypeEnum: string
{
    case Return = 'return';
    case Complaint = 'complaint';
    case Exchange = 'exchange';

    public function label(): string
    {
        return match ($this) {
            self::Return => 'Zwrot',
            self::Complaint => 'Reklamacja',
            self::Exchange => 'Wymiana',
        };
    }
}
