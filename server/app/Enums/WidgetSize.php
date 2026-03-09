<?php

declare(strict_types=1);

namespace App\Enums;

enum WidgetSize: string
{
    case Small = 'small';
    case Medium = 'medium';
    case Large = 'large';
    case Full = 'full';

    public function gridClass(): string
    {
        return match ($this) {
            self::Small => 'md:col-span-1',
            self::Medium => 'md:col-span-2',
            self::Large => 'md:col-span-3',
            self::Full => 'md:col-span-4',
        };
    }
}
