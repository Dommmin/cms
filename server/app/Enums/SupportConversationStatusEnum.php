<?php

declare(strict_types=1);

namespace App\Enums;

enum SupportConversationStatusEnum: string
{
    case OPEN = 'open';
    case PENDING = 'pending';
    case RESOLVED = 'resolved';
    case CLOSED = 'closed';

    public function getLabel(): string
    {
        return match ($this) {
            self::OPEN => 'Otwarte',
            self::PENDING => 'Oczekujące',
            self::RESOLVED => 'Rozwiązane',
            self::CLOSED => 'Zamknięte',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::OPEN => 'green',
            self::PENDING => 'yellow',
            self::RESOLVED => 'blue',
            self::CLOSED => 'gray',
        };
    }
}
