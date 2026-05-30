<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $locale_code
 * @property string $group
 * @property string $key
 * @property string $value
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Locale $locale
 *
 * @method static Builder<static>|Translation forLocale(string $localeCode)
 * @method static Builder<static>|Translation inGroup(string $group)
 * @method static Builder<static>|Translation newModelQuery()
 * @method static Builder<static>|Translation newQuery()
 * @method static Builder<static>|Translation query()
 * @method static Builder<static>|Translation whereCreatedAt($value)
 * @method static Builder<static>|Translation whereGroup($value)
 * @method static Builder<static>|Translation whereId($value)
 * @method static Builder<static>|Translation whereKey($value)
 * @method static Builder<static>|Translation whereLocaleCode($value)
 * @method static Builder<static>|Translation whereUpdatedAt($value)
 * @method static Builder<static>|Translation whereValue($value)
 *
 * @mixin Model
 */
#[Fillable([
    'locale_code',
    'group',
    'key',
    'value',
])]
class Translation extends Model
{
    use HasFactory;

    public function locale(): BelongsTo
    {
        return $this->belongsTo(Locale::class, 'locale_code', 'code');
    }

    #[Scope]
    protected function forLocale(Builder $query, string $localeCode): Builder
    {
        return $query->where('locale_code', $localeCode);
    }

    #[Scope]
    protected function inGroup(Builder $query, string $group): Builder
    {
        return $query->where('group', $group);
    }
}
