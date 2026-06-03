<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $system_page_key
 * @property int $page_id
 * @property string|null $locale
 * @property int $revision
 * @property string $version_label
 * @property string $content_checksum
 * @property CarbonImmutable|null $effective_from
 * @property CarbonImmutable|null $published_at
 * @property bool $is_current
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 *
 * @method static Builder<static>|PolicyDocumentVersion current()
 * @method static Builder<static>|PolicyDocumentVersion newModelQuery()
 * @method static Builder<static>|PolicyDocumentVersion newQuery()
 * @method static Builder<static>|PolicyDocumentVersion query()
 *
 * @mixin Model
 */
#[Fillable([
    'system_page_key',
    'page_id',
    'locale',
    'revision',
    'version_label',
    'content_checksum',
    'effective_from',
    'published_at',
    'is_current',
])]
#[Table(name: 'policy_document_versions')]
class PolicyDocumentVersion extends Model
{
    use HasFactory;

    protected $casts = [
        'effective_from' => 'datetime',
        'published_at' => 'datetime',
        'is_current' => 'boolean',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    protected function scopeCurrent(Builder $query): Builder
    {
        return $query->where('is_current', true);
    }
}
