<?php

declare(strict_types=1);

namespace App\Enums;

enum BlockDataStrategy: string
{
    case None = 'none';
    case Server = 'server';
    case Client = 'client';
    case Hybrid = 'hybrid';
    case Cached = 'cached';

    public function label(): string
    {
        return match ($this) {
            self::None => 'Static (configuration only)',
            self::Server => 'Server-side resolution',
            self::Client => 'Client-side fetch',
            self::Hybrid => 'Server shell + client hydration',
            self::Cached => 'Server with edge/cache tags',
        };
    }
}
