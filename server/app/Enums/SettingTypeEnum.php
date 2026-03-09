<?php

declare(strict_types=1);

namespace App\Enums;

enum SettingTypeEnum: string
{
    case String = 'string';
    case Integer = 'integer';
    case Boolean = 'boolean';
    case Json = 'json';
    case Encrypted = 'encrypted';
    case Image = 'image';

    public function label(): string
    {
        return match ($this) {
            self::String => 'Tekst',
            self::Integer => 'Liczba',
            self::Boolean => 'Tak/Nie',
            self::Json => 'JSON',
            self::Encrypted => 'Zaszyfrowane',
            self::Image => 'Zdjęcie',
        };
    }
}
