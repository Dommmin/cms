<?php

declare(strict_types=1);

namespace App\Enums;

enum PageLayoutEnum: string
{
    case Default = 'default';
    case FullWidth = 'full_width';
    case Sidebar = 'sidebar';

    public function label(): string
    {
        return match ($this) {
            self::Default => 'Standard',
            self::FullWidth => 'Pełna szerokość',
            self::Sidebar => 'Z sidebar',
        };
    }
}
