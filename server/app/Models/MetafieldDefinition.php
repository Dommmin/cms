<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MetafieldDefinition extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_type',
        'namespace',
        'key',
        'name',
        'type',
        'description',
        'validations',
        'pinned',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'validations' => 'array',
            'pinned' => 'boolean',
            'position' => 'integer',
        ];
    }

    /** @param Builder<MetafieldDefinition> $query */
    public function scopeForOwnerType(Builder $query, string $type): Builder
    {
        return $query->where('owner_type', $type);
    }

    /** @param Builder<MetafieldDefinition> $query */
    public function scopePinned(Builder $query): Builder
    {
        return $query->where('pinned', true);
    }
}
