<?php

declare(strict_types=1);

namespace App\Enums;

enum MenuLinkTypeEnum: string
{
    case Custom = 'custom';
    case Category = 'category';
    case Product = 'product';
    case Page = 'page';

    public function label(): string
    {
        return match ($this) {
            self::Custom => 'Custom URL',
            self::Category => 'Kategoria',
            self::Product => 'Produkt',
            self::Page => 'Strona',
        };
    }
}
