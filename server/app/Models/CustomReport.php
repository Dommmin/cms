<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\CustomReportFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $name
 * @property string $data_source
 * @property array $metrics
 * @property array $dimensions
 * @property array $filters
 * @property string $chart_type
 * @property int $user_id
 * @property string|null $description
 * @property array<array-key, mixed>|null $group_by
 * @property bool $is_public
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read User|null $user
 *
 * @method static CustomReportFactory factory($count = null, $state = [])
 * @method static Builder<static>|CustomReport newModelQuery()
 * @method static Builder<static>|CustomReport newQuery()
 * @method static Builder<static>|CustomReport query()
 * @method static Builder<static>|CustomReport whereChartType($value)
 * @method static Builder<static>|CustomReport whereCreatedAt($value)
 * @method static Builder<static>|CustomReport whereDataSource($value)
 * @method static Builder<static>|CustomReport whereDescription($value)
 * @method static Builder<static>|CustomReport whereDimensions($value)
 * @method static Builder<static>|CustomReport whereFilters($value)
 * @method static Builder<static>|CustomReport whereGroupBy($value)
 * @method static Builder<static>|CustomReport whereId($value)
 * @method static Builder<static>|CustomReport whereIsPublic($value)
 * @method static Builder<static>|CustomReport whereMetrics($value)
 * @method static Builder<static>|CustomReport whereName($value)
 * @method static Builder<static>|CustomReport whereUpdatedAt($value)
 * @method static Builder<static>|CustomReport whereUserId($value)
 *
 * @mixin Model
 */
#[Fillable([
    'user_id',
    'name',
    'description',
    'data_source',
    'metrics',
    'dimensions',
    'filters',
    'group_by',
    'chart_type',
    'is_public',
])]
final class CustomReport extends Model
{
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'metrics' => 'array',
            'dimensions' => 'array',
            'filters' => 'array',
            'group_by' => 'array',
            'is_public' => 'boolean',
        ];
    }
}
