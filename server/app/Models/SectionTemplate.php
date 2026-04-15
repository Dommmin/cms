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
 * @property string|null $description
 * @property string $category
 * @property string|null $thumbnail
 * @property array<string, mixed> $snapshot
 * @property int|null $created_by
 * @property bool $is_global
 * @property int $usage_count
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
