<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $owner_type
 * @property string $namespace
 * @property string $key
 * @property string $name
 * @property string $type
 * @property string|null $description
 * @property array<array-key, mixed>|null $validations
 * @property bool $pinned
 * @property int $position
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static Builder<static>|MetafieldDefinition forOwnerType(string $type)
 * @method static Builder<static>|MetafieldDefinition newModelQuery()
 * @method static Builder<static>|MetafieldDefinition newQuery()
 * @method static Builder<static>|MetafieldDefinition pinned()
 * @method static Builder<static>|MetafieldDefinition query()
 * @method static Builder<static>|MetafieldDefinition whereCreatedAt($value)
 * @method static Builder<static>|MetafieldDefinition whereDescription($value)
 * @method static Builder<static>|MetafieldDefinition whereId($value)
 * @method static Builder<static>|MetafieldDefinition whereKey($value)
 * @method static Builder<static>|MetafieldDefinition whereName($value)
 * @method static Builder<static>|MetafieldDefinition whereNamespace($value)
 * @method static Builder<static>|MetafieldDefinition whereOwnerType($value)
 * @method static Builder<static>|MetafieldDefinition wherePinned($value)
 * @method static Builder<static>|MetafieldDefinition wherePosition($value)
 * @method static Builder<static>|MetafieldDefinition whereType($value)
 * @method static Builder<static>|MetafieldDefinition whereUpdatedAt($value)
 * @method static Builder<static>|MetafieldDefinition whereValidations($value)
 * @mixin \Eloquent
 */
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
