<?php

declare(strict_types=1);

namespace App\Enums;

enum AttributeTypeEnum: string
{
    case TEXT = 'text';
    case SELECT = 'select';
    case MULTISELECT = 'multiselect';
    case NUMERIC = 'numeric';
    case BOOLEAN = 'boolean';
    case COLOR = 'color';
    case DATE = 'date';

    public function getLabel(): string
    {
        return match ($this) {
            self::TEXT => 'Text',
            self::SELECT => 'Select',
            self::MULTISELECT => 'Multiselect',
            self::NUMERIC => 'Numeric',
            self::BOOLEAN => 'Boolean',
            self::COLOR => 'Color',
            self::DATE => 'Date',
        };
    }
}
