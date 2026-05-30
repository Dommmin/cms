<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $shipping_zone_id
 * @property string $country_code
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read ShippingZone $shippingZone
 *
 * @method static Builder<static>|ShippingZoneCountry newModelQuery()
 * @method static Builder<static>|ShippingZoneCountry newQuery()
 * @method static Builder<static>|ShippingZoneCountry query()
 * @method static Builder<static>|ShippingZoneCountry whereCountryCode($value)
 * @method static Builder<static>|ShippingZoneCountry whereCreatedAt($value)
 * @method static Builder<static>|ShippingZoneCountry whereId($value)
 * @method static Builder<static>|ShippingZoneCountry whereShippingZoneId($value)
 * @method static Builder<static>|ShippingZoneCountry whereUpdatedAt($value)
 *
 * @mixin Model
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
