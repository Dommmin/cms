<?php

declare(strict_types=1);

namespace App\Models;

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
 */
final class CustomReport extends Model
{
    use HasFactory;

    protected $fillable = [
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
    ];

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
