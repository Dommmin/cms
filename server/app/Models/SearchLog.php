<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * @property int $id
 * @property string $query
 * @property int $results_count
 * @property bool $is_autocomplete
 * @property string|null $locale
 * @property string|null $searcher_type
 * @property int|null $searcher_id
 * @property string|null $ip
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read Model|\Eloquent|null $searcher
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchLog query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchLog whereIp($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchLog whereIsAutocomplete($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchLog whereLocale($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchLog whereQuery($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchLog whereResultsCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchLog whereSearcherId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchLog whereSearcherType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SearchLog whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'query',
    'results_count',
    'is_autocomplete',
    'locale',
    'ip',
])]
final class SearchLog extends Model
{
    use HasFactory;

    public function searcher(): MorphTo
    {
        return $this->morphTo();
    }

    protected function casts(): array
    {
        return [
            'is_autocomplete' => 'boolean',
            'results_count' => 'integer',
        ];
    }
}
