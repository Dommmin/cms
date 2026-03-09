<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\BlockRelation;
use App\Models\PageBlock;
use Illuminate\Support\Facades\DB;

class BlockRelationService
{
    public function syncRelations(PageBlock $block, array $relations): void
    {
        DB::transaction(function () use ($block, $relations) {
            $block->relations()->delete();

            foreach ($relations as $key => $data) {
                if (isset($data['type']) && isset($data['id'])) {
                    BlockRelation::create([
                        'page_block_id' => $block->id,
                        'relation_type' => $data['type'],
                        'relation_id' => $data['id'],
                        'relation_key' => $key,
                        'position' => 0,
                        'metadata' => $data['metadata'] ?? null,
                    ]);

                    continue;
                }

                if (is_array($data)) {
                    foreach ($data as $index => $item) {
                        if (! isset($item['type']) || ! isset($item['id'])) {
                            continue;
                        }

                        BlockRelation::create([
                            'page_block_id' => $block->id,
                            'relation_type' => $item['type'],
                            'relation_id' => $item['id'],
                            'relation_key' => $key,
                            'position' => $index,
                            'metadata' => $item['metadata'] ?? null,
                        ]);
                    }
                }
            }
        });
    }

    public function addRelation(
        PageBlock $block,
        string $type,
        int $id,
        ?string $key = null,
        ?array $metadata = null
    ): BlockRelation {
        $position = $block->relations()
            ->where('relation_type', $type)
            ->where('relation_key', $key)
            ->max('position') ?? -1;

        return BlockRelation::create([
            'page_block_id' => $block->id,
            'relation_type' => $type,
            'relation_id' => $id,
            'relation_key' => $key,
            'position' => $position + 1,
            'metadata' => $metadata,
        ]);
    }

    public function removeRelation(PageBlock $block, int $relationId): bool
    {
        return $block->relations()->where('id', $relationId)->delete() > 0;
    }

    public function reorderRelations(PageBlock $block, string $type, ?string $key, array $orderedIds): void
    {
        DB::transaction(function () use ($block, $type, $key, $orderedIds) {
            $relations = $block->relations()
                ->where('relation_type', $type)
                ->where('relation_key', $key)
                ->get()
                ->keyBy('id');

            foreach ($orderedIds as $position => $relationId) {
                if (isset($relations[$relationId])) {
                    $relations[$relationId]->update(['position' => $position]);
                }
            }
        });
    }

    public function validateRelations(string $blockTypeKey, array $relations): array
    {
        $config = config("blocks.block_types.{$blockTypeKey}");
        if (! $config || ! isset($config['allowed_relations'])) {
            return ['error' => 'Invalid block type or missing configuration'];
        }

        $allowedRelations = $config['allowed_relations'];
        $errors = [];

        foreach ($relations as $key => $data) {
            if (! isset($allowedRelations[$key])) {
                $errors[] = "Relation key '{$key}' is not allowed for this block type";

                continue;
            }

            $allowedTypes = $allowedRelations[$key];

            $items = isset($data['type']) ? [$data] : $data;

            foreach ($items as $item) {
                if (! isset($item['type']) || ! in_array($item['type'], $allowedTypes, true)) {
                    $errors[] = "Relation type '{$item['type']}' is not allowed for key '{$key}'";
                }
            }
        }

        return $errors;
    }
}
