<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PageBlockTypeEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
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

    public function getRelatedModels(string $type, ?string $key = null): Collection
    {
        $relations = $this->getRelationsByType($type, $key);

        $config = config('blocks.relation_types.'.$type);
        if (! $config) {
            return collect();
        }

        $modelClass = $config['model'];
        $ids = $relations->pluck('relation_id')->toArray();

        if (empty($ids)) {
            return collect();
        }

        $models = $modelClass::whereIn('id', $ids)->get();

        return collect($ids)->map(fn ($id) => $models->firstWhere('id', $id))->filter();
    }

    public function getMediaByKey(string $key): Collection
    {
        return $this->getRelatedModels('media.image', $key)
            ->merge($this->getRelatedModels('media.icon', $key))
            ->merge($this->getRelatedModels('media.file', $key));
    }

    public function getSingleMedia(string $key): ?Media
    {
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

            $modelClass = $config['model'];
            $ids = $relations->pluck('relation_id')->toArray();
            $models = $modelClass::whereIn('id', $ids)->get();

            $byKey = $relations->groupBy('relation_key');

            foreach ($byKey as $key => $keyRelations) {
                $resolvedModels = $keyRelations->map(function ($rel) use ($models): ?array {
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
