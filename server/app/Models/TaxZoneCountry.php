<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $tax_zone_id
 * @property string $country_code
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read TaxZone $taxZone
 *
 * @mixin Model
 */
#[Fillable([
    'tax_zone_id', 'country_code',
])]
#[Table(name: 'tax_zone_countries')]
class TaxZoneCountry extends Model
{
    use HasFactory;

    public function taxZone(): BelongsTo
    {
        return $this->belongsTo(TaxZone::class);
    }
}
