<?php

declare(strict_types=1);

namespace App\Enums;

enum AttributeTypeEnum: string
{
    case TEXT = 'text';
    case SELECT = 'select';
    case MULTISELECT = 'multiselect';
    case NUMERIC = 'numeric';
    case COLOR = 'color';

    public function getLabel(): string
    {
        return match ($this) {
            self::TEXT => 'Text',
            self::SELECT => 'Select',
            self::MULTISELECT => 'Multiselect',
            self::NUMERIC => 'Numeric',
            self::COLOR => 'Color',
        };
    }
}
