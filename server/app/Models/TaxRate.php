<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $name
 * @property int $rate
 * @property string|null $country_code
 * @property int|null $tax_zone_id
 * @property bool $is_active
 * @property bool $is_default
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Collection<int, Category> $categories
 * @property-read int|null $categories_count
 * @property-read Collection<int, ProductVariant> $variants
 * @property-read int|null $variants_count
 * @property-read TaxZone|null $taxZone
 *
 * @method static Builder<static>|TaxRate newModelQuery()
 * @method static Builder<static>|TaxRate newQuery()
 * @method static Builder<static>|TaxRate query()
 * @method static Builder<static>|TaxRate whereCountryCode($value)
 * @method static Builder<static>|TaxRate whereCreatedAt($value)
 * @method static Builder<static>|TaxRate whereId($value)
 * @method static Builder<static>|TaxRate whereIsActive($value)
 * @method static Builder<static>|TaxRate whereIsDefault($value)
 * @method static Builder<static>|TaxRate whereName($value)
 * @method static Builder<static>|TaxRate whereRate($value)
 * @method static Builder<static>|TaxRate whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'name', 'rate', 'country_code', 'is_active', 'is_default', 'tax_zone_id',
])]
#[Table(name: 'tax_rates')]
class TaxRate extends Model
{
    use HasFactory;
    use LogsActivity;

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

    public static function default(): ?self
    {
        return self::query()->where('is_default', true)->first();
    }

    public function taxZone(): BelongsTo
    {
        return $this->belongsTo(TaxZone::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'rate'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('tax_rate');
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /** Oblicza VAT z ceny brutto (grosze) */
    public function taxFromGross(int $grossPrice): int
    {
        return (int) round($grossPrice - ($grossPrice / (1 + $this->rate / 100)));
    }

    /** Oblicza cenę netto z brutto (grosze) */
    public function netFromGross(int $grossPrice): int
    {
        return (int) round($grossPrice / (1 + $this->rate / 100));
    }
}
