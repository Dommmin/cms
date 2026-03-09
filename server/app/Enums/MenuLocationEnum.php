<?php

declare(strict_types=1);

namespace App\Enums;

enum MenuLocationEnum: string
{
    case Header = 'header';
    case Footer = 'footer';
    case FooterLegal = 'footer_legal';

    public function label(): string
    {
        return match ($this) {
            self::Header => 'Header Navigation',
            self::Footer => 'Footer Links',
            self::FooterLegal => 'Footer Legal',
        };
    }
}
