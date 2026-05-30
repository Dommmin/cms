<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string $category
 * @property string|null $thumbnail
 * @property array<string, mixed> $snapshot
 * @property int|null $created_by
 * @property bool $is_global
 * @property int $usage_count
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read User|null $creator
 *
 * @method static Builder<static>|SectionTemplate newModelQuery()
 * @method static Builder<static>|SectionTemplate newQuery()
 * @method static Builder<static>|SectionTemplate query()
 * @method static Builder<static>|SectionTemplate whereCategory($value)
 * @method static Builder<static>|SectionTemplate whereCreatedAt($value)
 * @method static Builder<static>|SectionTemplate whereCreatedBy($value)
 * @method static Builder<static>|SectionTemplate whereDescription($value)
 * @method static Builder<static>|SectionTemplate whereId($value)
 * @method static Builder<static>|SectionTemplate whereIsGlobal($value)
 * @method static Builder<static>|SectionTemplate whereName($value)
 * @method static Builder<static>|SectionTemplate whereSnapshot($value)
 * @method static Builder<static>|SectionTemplate whereThumbnail($value)
 * @method static Builder<static>|SectionTemplate whereUpdatedAt($value)
 * @method static Builder<static>|SectionTemplate whereUsageCount($value)
 *
 * @mixin Model
 */
#[Fillable([
    'name',
    'description',
    'category',
    'thumbnail',
    'snapshot',
    'created_by',
    'is_global',
    'usage_count',
])]
class SectionTemplate extends Model
{
    use HasFactory;

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    protected function casts(): array
    {
        return [
            'snapshot' => 'array',
            'is_global' => 'boolean',
            'usage_count' => 'integer',
        ];
    }
}
