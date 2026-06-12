<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
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
 * @property string $visibility
 * @property bool $storefront_exposed
 * @property string|null $description
 * @property array<array-key, mixed>|null $validations
 * @property bool $pinned
 * @property int $position
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 *
 * @method static Builder<static>|MetafieldDefinition forOwnerType(string $type)
 * @method static Builder<static>|MetafieldDefinition newModelQuery()
 * @method static Builder<static>|MetafieldDefinition newQuery()
 * @method static Builder<static>|MetafieldDefinition pinned()
 * @method static Builder<static>|MetafieldDefinition query()
 * @method static Builder<static>|MetafieldDefinition publiclyVisible()
 * @method static Builder<static>|MetafieldDefinition whereCreatedAt($value)
 * @method static Builder<static>|MetafieldDefinition whereDescription($value)
 * @method static Builder<static>|MetafieldDefinition whereId($value)
 * @method static Builder<static>|MetafieldDefinition whereKey($value)
 * @method static Builder<static>|MetafieldDefinition whereName($value)
 * @method static Builder<static>|MetafieldDefinition whereNamespace($value)
 * @method static Builder<static>|MetafieldDefinition whereOwnerType($value)
 * @method static Builder<static>|MetafieldDefinition wherePinned($value)
 * @method static Builder<static>|MetafieldDefinition wherePosition($value)
 * @method static Builder<static>|MetafieldDefinition whereStorefrontExposed($value)
 * @method static Builder<static>|MetafieldDefinition whereType($value)
 * @method static Builder<static>|MetafieldDefinition whereVisibility($value)
 * @method static Builder<static>|MetafieldDefinition whereUpdatedAt($value)
 * @method static Builder<static>|MetafieldDefinition whereValidations($value)
 *
 * @mixin Model
 */
#[Fillable([
    'owner_type',
    'namespace',
    'key',
    'name',
    'type',
    'visibility',
    'storefront_exposed',
    'description',
    'validations',
    'pinned',
    'position',
])]
class MetafieldDefinition extends Model
{
    use HasFactory;

    public function isPubliclyVisible(): bool
    {
        return $this->visibility === 'storefront' || $this->storefront_exposed;
    }

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

    /** @param Builder<MetafieldDefinition> $query */
    protected function scopePubliclyVisible(Builder $query): Builder
    {
        return $query->where(function (Builder $query): void {
            $query->where('visibility', 'storefront')
                ->orWhere('storefront_exposed', true);
        });
    }

    protected function casts(): array
    {
        return [
            'validations' => 'array',
            'storefront_exposed' => 'boolean',
            'pinned' => 'boolean',
            'position' => 'integer',
        ];
    }
}
