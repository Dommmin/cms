<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $subject
 * @property string $body
 */
#[Fillable([
    'name',
    'key',
    'subject',
    'body',
    'description',
    'is_active',
    'variables',
])]
class EmailTemplate extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'variables' => 'array',
        ];
    }
}
