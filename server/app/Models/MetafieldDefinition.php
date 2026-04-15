<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'owner_type',
    'namespace',
    'key',
    'name',
    'type',
    'description',
    'validations',
    'pinned',
    'position',
])]
class MetafieldDefinition extends Model
{
    use HasFactory;

    /** @param Builder<MetafieldDefinition> $query */
    protected function scopeForOwnerType(Builder $query, string $type): Builder
    {
        return $query->where('owner_type', $type);
    }

    /** @param Builder<MetafieldDefinition> $query */
    protected function scopePinned(Builder $query): Builder
    {
        return $query->where('pinned', true);
    }

    protected function casts(): array
    {
        return [
            'validations' => 'array',
            'pinned' => 'boolean',
            'position' => 'integer',
        ];
    }
}
