<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property string $native_name
 * @property string|null $flag_emoji
 * @property string|null $currency_code
 * @property bool $is_default
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Translation> $translations
 * @property-read int|null $translations_count
 *
 * @method static Builder<static>|Locale active()
 * @method static Builder<static>|Locale default()
 * @method static Builder<static>|Locale newModelQuery()
 * @method static Builder<static>|Locale newQuery()
 * @method static Builder<static>|Locale query()
 * @method static Builder<static>|Locale whereCode($value)
 * @method static Builder<static>|Locale whereCreatedAt($value)
 * @method static Builder<static>|Locale whereCurrencyCode($value)
 * @method static Builder<static>|Locale whereFlagEmoji($value)
 * @method static Builder<static>|Locale whereId($value)
 * @method static Builder<static>|Locale whereIsActive($value)
 * @method static Builder<static>|Locale whereIsDefault($value)
 * @method static Builder<static>|Locale whereName($value)
 * @method static Builder<static>|Locale whereNativeName($value)
 * @method static Builder<static>|Locale whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'code',
    'name',
    'native_name',
    'flag_emoji',
    'currency_code',
    'is_default',
    'is_active',
])]
class Locale extends Model
{
    use HasFactory;
    use LogsActivity;

    /**
     * @return Collection<Locale>
     */
    public static function getLocales(): Collection
    {
        return self::query()
            ->select(['code', 'name', 'native_name', 'flag_emoji', 'is_default'])
            ->active()
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['code', 'name', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('locale');
    }

    public function translations(): HasMany
    {
        return $this->hasMany(Translation::class, 'locale_code', 'code');
    }

    #[Scope]
    protected function active(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    #[Scope]
    protected function default(Builder $query): Builder
    {
        return $query->where('is_default', true);
    }

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}
