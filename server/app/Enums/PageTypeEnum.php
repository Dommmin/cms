<?php

declare(strict_types=1);

namespace App\Enums;

enum PageTypeEnum: string
{
    case Blocks = 'blocks';
    case Module = 'module';

    public function label(): string
    {
        return match ($this) {
            self::Blocks => 'Bloki (Page Builder)',
            self::Module => 'Moduł (Własny widok)',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Blocks => 'Strona zbudowana z modułowych bloków (hero, tekst, produkty, etc.)',
            self::Module => 'Strona wykorzystująca dedykowany moduł (np. content, blog, katalog)',
        };
    }
}
