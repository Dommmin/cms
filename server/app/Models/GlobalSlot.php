<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\SlotLocationEnum;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property SlotLocationEnum $location
 * @property int|null $reusable_block_id
 * @property string $label
 * @property array<string, mixed>|null $configuration
 * @property bool $is_active
 * @property int $position
 * @property array<string, mixed>|null $settings
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read ReusableBlock|null $reusableBlock
 *
 * @method static Builder<static>|GlobalSlot active()
 * @method static Builder<static>|GlobalSlot forLocation(SlotLocationEnum|string $location)
 * @method static Builder<static>|GlobalSlot newModelQuery()
 * @method static Builder<static>|GlobalSlot newQuery()
 * @method static Builder<static>|GlobalSlot query()
 *
 * @mixin Model
 */
#[Fillable([
    'location',
    'reusable_block_id',
    'label',
    'configuration',
    'is_active',
    'position',
    'settings',
])]
#[Table(name: 'global_slots')]
class GlobalSlot extends Model
{
    use HasFactory;

    public function reusableBlock(): BelongsTo
    {
        return $this->belongsTo(ReusableBlock::class);
    }

    /**
     * Scope a query to only include active slots.
     */
    protected function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /**
     * Scope a query to only include slots for a given location.
     */
    protected function scopeForLocation(Builder $query, SlotLocationEnum|string $location): void
    {
        $val = $location instanceof SlotLocationEnum ? $location->value : $location;
        $query->where('location', $val);
    }

    protected function casts(): array
    {
        return [
            'location' => SlotLocationEnum::class,
            'configuration' => 'array',
            'settings' => 'array',
            'is_active' => 'boolean',
            'position' => 'integer',
        ];
    }
}
