<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PageBlockTypeEnum;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * @property int $id
 * @property int $page_id
 * @property int $section_id
 * @property PageBlockTypeEnum $type
 * @property array<string, mixed>|null $configuration
 * @property int $position
 * @property bool $is_active
 * @property-read Page $page
 * @property-read PageSection|null $section
 * @property-read Collection<BlockRelation> $relations
 * @property int|null $reusable_block_id
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read int|null $relations_count
 * @property-read ReusableBlock|null $reusableBlock
 *
 * @method static Builder<static>|PageBlock newModelQuery()
 * @method static Builder<static>|PageBlock newQuery()
 * @method static Builder<static>|PageBlock query()
 * @method static Builder<static>|PageBlock whereConfiguration($value)
 * @method static Builder<static>|PageBlock whereCreatedAt($value)
 * @method static Builder<static>|PageBlock whereId($value)
 * @method static Builder<static>|PageBlock whereIsActive($value)
 * @method static Builder<static>|PageBlock wherePageId($value)
 * @method static Builder<static>|PageBlock wherePosition($value)
 * @method static Builder<static>|PageBlock whereReusableBlockId($value)
 * @method static Builder<static>|PageBlock whereSectionId($value)
 * @method static Builder<static>|PageBlock whereType($value)
 * @method static Builder<static>|PageBlock whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'page_id', 'section_id', 'type', 'configuration', 'position', 'is_active', 'reusable_block_id',
])]
#[Table(name: 'page_blocks')]
class PageBlock extends Model
{
    use HasFactory;

    protected $casts = [
        'type' => PageBlockTypeEnum::class,
        'configuration' => 'array',
        'is_active' => 'boolean',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class, 'page_id');
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(PageSection::class, 'section_id');
    }

    public function reusableBlock(): BelongsTo
    {
        return $this->belongsTo(ReusableBlock::class);
    }

    public function relations(): HasMany
    {
        return $this->hasMany(BlockRelation::class, 'page_block_id');
    }

    public function getRelationsByType(string $type, ?string $key = null): Collection
    {
        $query = $this->relations()
            ->where('relation_type', $type)
            ->orderBy('position');

        if ($key !== null) {
            $query->where('relation_key', $key);
        }

        return $query->get();
    }

    public function getRelatedModels(string $type, ?string $key = null): \Illuminate\Support\Collection
    {
        $relations = $this->getRelationsByType($type, $key);

        $config = config('blocks.relation_types.'.$type);
        if (! $config) {
            return collect();
        }

        /** @var class-string<Model> $modelClass */
        $modelClass = $config['model'];
        $ids = $relations->pluck('relation_id')->toArray();

        if (empty($ids)) {
            return collect();
        }

        $models = $modelClass::query()->whereIn('id', $ids)->get();

        return collect($ids)->map(fn ($id) => $models->firstWhere('id', $id))->filter();
    }

    public function getMediaByKey(string $key): \Illuminate\Support\Collection
    {
        return $this->getRelatedModels('media.image', $key)
            ->merge($this->getRelatedModels('media.icon', $key))
            ->merge($this->getRelatedModels('media.file', $key));
    }

    public function getSingleMedia(string $key): ?Media
    {
        /** @var BlockRelation|null $relation */
        $relation = $this->relations()
            ->where('relation_key', $key)
            ->whereIn('relation_type', ['media.image', 'media.icon', 'media.file'])
            ->first();

        return $relation ? Media::query()->find($relation->relation_id) : null;
    }

    public function toFrontendArray(): array
    {
        $data = [
            'id' => $this->id,
            'type' => $this->type->value,
            'configuration' => $this->configuration,
            'position' => $this->position,
            'relations' => [],
        ];

        $groupedRelations = $this->relations->groupBy('relation_type');

        foreach ($groupedRelations as $type => $relations) {
            $config = config('blocks.relation_types.'.$type);
            if (! $config) {
                continue;
            }

            /** @var class-string<Model> $modelClass */
            $modelClass = $config['model'];
            $ids = $relations->pluck('relation_id')->toArray();
            $models = $modelClass::query()->whereIn('id', $ids)->get();

            $byKey = $relations->groupBy('relation_key');

            foreach ($byKey as $key => $keyRelations) {
                $resolvedModels = $keyRelations->map(function ($rel) use ($models): ?array {
                    /** @var BlockRelation $rel */
                    $model = $models->firstWhere('id', $rel->relation_id);

                    return $model ? [
                        'model' => $model,
                        'metadata' => $rel->metadata,
                        'position' => $rel->position,
                    ] : null;
                })->filter()->sortBy('position')->values();

                $storageKey = $key ?: $type;
                $data['relations'][$storageKey] = $resolvedModels;
            }
        }

        return $data;
    }
}
