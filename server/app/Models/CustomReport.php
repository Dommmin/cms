<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
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
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $user
 * @method static \Database\Factories\CustomReportFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomReport newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomReport newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomReport query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomReport whereChartType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomReport whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomReport whereDataSource($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomReport whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomReport whereDimensions($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomReport whereFilters($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomReport whereGroupBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomReport whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomReport whereIsPublic($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomReport whereMetrics($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomReport whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomReport whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomReport whereUserId($value)
 * @mixin \Eloquent
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
