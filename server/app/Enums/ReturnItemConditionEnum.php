<?php

declare(strict_types=1);

namespace App\Enums;

enum ReturnItemConditionEnum: string
{
    case Unopened = 'unopened';
    case Opened = 'opened';
    case Damaged = 'damaged';
    case Defective = 'defective';

    public function label(): string
    {
        return match ($this) {
            self::Unopened => 'Unopened',
            self::Opened => 'Opened',
            self::Damaged => 'Damaged',
            self::Defective => 'Defective',
        };
    }
}
