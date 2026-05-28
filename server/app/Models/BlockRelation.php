<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * @property int $id
 * @property int $page_block_id
 * @property string $relation_type
 * @property int $relation_id
 * @property string|null $relation_key
 * @property int $position
 * @property array|null $metadata
 * @property-read PageBlock $block
 * @property-read Model $related
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static Builder<static>|BlockRelation newModelQuery()
 * @method static Builder<static>|BlockRelation newQuery()
 * @method static Builder<static>|BlockRelation ofType(string $type)
 * @method static Builder<static>|BlockRelation ordered()
 * @method static Builder<static>|BlockRelation query()
 * @method static Builder<static>|BlockRelation whereCreatedAt($value)
 * @method static Builder<static>|BlockRelation whereId($value)
 * @method static Builder<static>|BlockRelation whereMetadata($value)
 * @method static Builder<static>|BlockRelation wherePageBlockId($value)
 * @method static Builder<static>|BlockRelation wherePosition($value)
 * @method static Builder<static>|BlockRelation whereRelationId($value)
 * @method static Builder<static>|BlockRelation whereRelationKey($value)
 * @method static Builder<static>|BlockRelation whereRelationType($value)
 * @method static Builder<static>|BlockRelation whereUpdatedAt($value)
 * @method static Builder<static>|BlockRelation withKey(string $key)
 * @mixin \Eloquent
 */
#[Fillable([
    'page_block_id',
    'relation_type',
    'relation_id',
    'relation_key',
    'position',
    'metadata',
])]
#[Table(name: 'block_relations')]
class BlockRelation extends Model
{
    use HasFactory;
    use HasFactory;

    protected $casts = [
        'metadata' => 'array',
        'position' => 'integer',
    ];

    public function block(): BelongsTo
    {
        return $this->belongsTo(PageBlock::class, 'page_block_id');
    }

    public function related(): MorphTo
    {
        return $this->morphTo(null, 'relation_type', 'relation_id');
    }

    public function resolveRelated(): ?Model
    {
        $config = config('blocks.relation_types');

        if (! isset($config[$this->relation_type])) {
            return null;
        }

        $modelClass = $config[$this->relation_type]['model'];

        return $modelClass::find($this->relation_id);
    }

    #[Scope]
    protected function ofType(Builder $query, string $type): Builder
    {
        return $query->where('relation_type', $type);
    }

    #[Scope]
    protected function withKey(Builder $query, string $key): Builder
    {
        return $query->where('relation_key', $key);
    }

    #[Scope]
    protected function ordered(Builder $query): Builder
    {
        return $query->orderBy('position');
    }
}
