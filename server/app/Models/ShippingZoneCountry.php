<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $shipping_zone_id
 * @property string $country_code
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\ShippingZone $shippingZone
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingZoneCountry newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingZoneCountry newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingZoneCountry query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingZoneCountry whereCountryCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingZoneCountry whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingZoneCountry whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingZoneCountry whereShippingZoneId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ShippingZoneCountry whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'shipping_zone_id',
    'country_code',
])]
class ShippingZoneCountry extends Model
{
    use HasFactory;

    public function shippingZone(): BelongsTo
    {
        return $this->belongsTo(ShippingZone::class);
    }
}
