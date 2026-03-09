<?php

declare(strict_types=1);

namespace App\Enums;

enum AudienceTypeEnum: string
{
    case All = 'all';
    case Segment = 'segment';
    case Tags = 'tags';

    public function label(): string
    {
        return match ($this) {
            self::All => 'Wszyscy subskrybenci',
            self::Segment => 'Segment',
            self::Tags => 'Tags',
        };
    }
}
