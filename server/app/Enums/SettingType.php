<?php

declare(strict_types=1);

namespace App\Enums;

enum SettingType: string
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
            self::String => 'String',
            self::Integer => 'Integer',
            self::Boolean => 'Boolean',
            self::Json => 'Json',
            self::Encrypted => 'Encrypted',
            self::Image => 'Image',
        };
    }
}

