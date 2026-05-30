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
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property string|null $logo_path
 * @property bool $is_active
 * @property int $position
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property CarbonImmutable|null $deleted_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read Collection<int, Product> $products
 * @property-read int|null $products_count
 *
 * @method static Builder<static>|Brand newModelQuery()
 * @method static Builder<static>|Brand newQuery()
 * @method static Builder<static>|Brand onlyTrashed()
 * @method static Builder<static>|Brand query()
 * @method static Builder<static>|Brand whereCreatedAt($value)
 * @method static Builder<static>|Brand whereDeletedAt($value)
 * @method static Builder<static>|Brand whereDescription($value)
 * @method static Builder<static>|Brand whereId($value)
 * @method static Builder<static>|Brand whereIsActive($value)
 * @method static Builder<static>|Brand whereLogoPath($value)
 * @method static Builder<static>|Brand whereName($value)
 * @method static Builder<static>|Brand wherePosition($value)
 * @method static Builder<static>|Brand whereSlug($value)
 * @method static Builder<static>|Brand whereUpdatedAt($value)
 * @method static Builder<static>|Brand withTrashed(bool $withTrashed = true)
 * @method static Builder<static>|Brand withoutTrashed()
 *
 * @mixin Model
 */
#[Fillable([
    'name', 'slug', 'description', 'logo_path', 'is_active', 'position',
])]
#[Table(name: 'brands')]
class Brand extends Model
{
    use HasFactory;
    use LogsActivity;
    use SoftDeletes;

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public static function active(): Builder
    {
        return self::query()->where('is_active', true);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('brand');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
