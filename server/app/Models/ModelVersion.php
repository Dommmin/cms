<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\WithoutTimestamps;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * @property int $id
 * @property string $versionable_type
 * @property int $versionable_id
 * @property int $version_number
 * @property array<array-key, mixed> $snapshot
 * @property array<array-key, mixed>|null $changes
 * @property string $event
 * @property int|null $created_by
 * @property string|null $change_note
 * @property CarbonImmutable $created_at
 * @property-read User|null $creator
 * @property-read Model $versionable
 *
 * @method static Builder<static>|ModelVersion newModelQuery()
 * @method static Builder<static>|ModelVersion newQuery()
 * @method static Builder<static>|ModelVersion query()
 * @method static Builder<static>|ModelVersion whereChangeNote($value)
 * @method static Builder<static>|ModelVersion whereChanges($value)
 * @method static Builder<static>|ModelVersion whereCreatedAt($value)
 * @method static Builder<static>|ModelVersion whereCreatedBy($value)
 * @method static Builder<static>|ModelVersion whereEvent($value)
 * @method static Builder<static>|ModelVersion whereId($value)
 * @method static Builder<static>|ModelVersion whereSnapshot($value)
 * @method static Builder<static>|ModelVersion whereVersionNumber($value)
 * @method static Builder<static>|ModelVersion whereVersionableId($value)
 * @method static Builder<static>|ModelVersion whereVersionableType($value)
 *
 * @mixin Model
 */
#[Fillable([
    'versionable_type',
    'versionable_id',
    'version_number',
    'snapshot',
    'changes',
    'event',
    'created_by',
    'change_note',
    'created_at',
])]
#[WithoutTimestamps]
class ModelVersion extends Model
{
    use HasFactory;

    /**
     * Compute field-by-field diff between two snapshots.
     *
     * @param  array<string, mixed>  $old
     * @param  array<string, mixed>  $new
     * @return array<string, array{old: mixed, new: mixed}>
     */
    public static function diff(array $old, array $new): array
    {
        $diff = [];
        $keys = array_unique(array_merge(array_keys($old), array_keys($new)));

        foreach ($keys as $key) {
            $oldVal = $old[$key] ?? null;
            $newVal = $new[$key] ?? null;

            if ($oldVal !== $newVal) {
                $diff[$key] = ['old' => $oldVal, 'new' => $newVal];
            }
        }

        return $diff;
    }

    public function versionable(): MorphTo
    {
        return $this->morphTo();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    protected function casts(): array
    {
        return [
            'snapshot' => 'array',
            'changes' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
