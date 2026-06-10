<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $base_rate
 * @property int $per_kg_rate
 * @property string $name
 * @property string|null $description
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, ShippingZoneCountry> $countries
 * @property-read int|null $countries_count
 *
 * @method static Builder<static>|ShippingZone newModelQuery()
 * @method static Builder<static>|ShippingZone newQuery()
 * @method static Builder<static>|ShippingZone query()
 * @method static Builder<static>|ShippingZone whereBaseRate($value)
 * @method static Builder<static>|ShippingZone whereCreatedAt($value)
 * @method static Builder<static>|ShippingZone whereDescription($value)
 * @method static Builder<static>|ShippingZone whereId($value)
 * @method static Builder<static>|ShippingZone whereIsActive($value)
 * @method static Builder<static>|ShippingZone whereName($value)
 * @method static Builder<static>|ShippingZone wherePerKgRate($value)
 * @method static Builder<static>|ShippingZone whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'name',
    'description',
    'is_active',
    'base_rate',
    'per_kg_rate',
])]
class ShippingZone extends Model
{
    use HasFactory;

    public function countries(): HasMany
    {
        return $this->hasMany(ShippingZoneCountry::class);
    }

    public function calculateShippingCost(float $weightKg, int $orderValue): int
    {
        return $this->base_rate + (int) ($this->per_kg_rate * $weightKg);
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'base_rate' => 'integer',
            'per_kg_rate' => 'integer',
        ];
    }
}
