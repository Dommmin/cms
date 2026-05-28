<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property string $type
 * @property array<string, mixed>|null $configuration
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property array<array-key, mixed>|null $relations_config
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PageBlock> $pageBlocks
 * @property-read int|null $page_blocks_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReusableBlock newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReusableBlock newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReusableBlock query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReusableBlock whereConfiguration($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReusableBlock whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReusableBlock whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReusableBlock whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReusableBlock whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReusableBlock whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReusableBlock whereRelationsConfig($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReusableBlock whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReusableBlock whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'name',
    'description',
    'type',
    'configuration',
    'relations_config',
    'is_active',
])]
class ReusableBlock extends Model
{
    use HasFactory;

    public function pageBlocks(): HasMany
    {
        return $this->hasMany(PageBlock::class);
    }

    /**
     * Sync this global block's configuration to all linked PageBlocks.
     */
    public function syncToPageBlocks(): void
    {
        $this->pageBlocks()->update([
            'configuration' => $this->configuration,
        ]);
    }

    protected function casts(): array
    {
        return [
            'configuration' => 'array',
            'relations_config' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
