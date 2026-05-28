<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property float $base_rate
 * @property float $per_kg_rate
 * @property string $name
 * @property string|null $description
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ShippingZoneCountry> $countries
 * @property-read int|null $countries_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingZone newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingZone newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingZone query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingZone whereBaseRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingZone whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingZone whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingZone whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingZone whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingZone whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingZone wherePerKgRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingZone whereUpdatedAt($value)
 * @mixin \Eloquent
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

    protected $casts = [
        'is_active' => 'boolean',
        'base_rate' => 'integer',
        'per_kg_rate' => 'integer',
    ];

    public function countries(): HasMany
    {
        return $this->hasMany(ShippingZoneCountry::class);
    }

    public function calculateShippingCost(float $weightKg, int $orderValue): int
    {
        return $this->base_rate + (int) ($this->per_kg_rate * $weightKg);
    }
}
