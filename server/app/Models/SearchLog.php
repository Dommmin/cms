<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
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
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Model|null $searcher
 *
 * @method static Builder<static>|SearchLog newModelQuery()
 * @method static Builder<static>|SearchLog newQuery()
 * @method static Builder<static>|SearchLog query()
 * @method static Builder<static>|SearchLog whereCreatedAt($value)
 * @method static Builder<static>|SearchLog whereId($value)
 * @method static Builder<static>|SearchLog whereIp($value)
 * @method static Builder<static>|SearchLog whereIsAutocomplete($value)
 * @method static Builder<static>|SearchLog whereLocale($value)
 * @method static Builder<static>|SearchLog whereQuery($value)
 * @method static Builder<static>|SearchLog whereResultsCount($value)
 * @method static Builder<static>|SearchLog whereSearcherId($value)
 * @method static Builder<static>|SearchLog whereSearcherType($value)
 * @method static Builder<static>|SearchLog whereUpdatedAt($value)
 *
 * @mixin Model
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
