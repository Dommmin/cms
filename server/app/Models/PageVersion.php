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
 * @property int $page_id
 * @property int $version_number
 * @property array<array-key, mixed> $snapshot Full page + content + sections snapshot
 * @property int|null $created_by
 * @property string|null $change_note
 * @property bool $is_autosave
 * @property string $source
 * @property int $is_published
 * @property string|null $published_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read User|null $creator
 * @property-read Page $page
 *
 * @method static Builder<static>|PageVersion newModelQuery()
 * @method static Builder<static>|PageVersion newQuery()
 * @method static Builder<static>|PageVersion query()
 * @method static Builder<static>|PageVersion whereChangeNote($value)
 * @method static Builder<static>|PageVersion whereCreatedAt($value)
 * @method static Builder<static>|PageVersion whereCreatedBy($value)
 * @method static Builder<static>|PageVersion whereId($value)
 * @method static Builder<static>|PageVersion whereIsAutosave($value)
 * @method static Builder<static>|PageVersion whereIsPublished($value)
 * @method static Builder<static>|PageVersion wherePageId($value)
 * @method static Builder<static>|PageVersion wherePublishedAt($value)
 * @method static Builder<static>|PageVersion whereSnapshot($value)
 * @method static Builder<static>|PageVersion whereSource($value)
 * @method static Builder<static>|PageVersion whereUpdatedAt($value)
 * @method static Builder<static>|PageVersion whereVersionNumber($value)
 *
 * @mixin Model
 */
#[Fillable([
    'page_id', 'version_number', 'snapshot', 'created_by', 'change_note', 'is_autosave', 'source',
])]
#[Table(name: 'page_versions')]
class PageVersion extends Model
{
    use HasFactory;

    protected $casts = [
        'snapshot' => 'array',
        'is_autosave' => 'boolean',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class, 'page_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
