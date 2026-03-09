<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ModelVersion extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'versionable_type',
        'versionable_id',
        'version_number',
        'snapshot',
        'changes',
        'event',
        'created_by',
        'change_note',
        'created_at',
    ];

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
