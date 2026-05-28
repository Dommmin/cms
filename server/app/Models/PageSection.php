<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $page_id
 * @property string|null $section_type
 * @property string $layout
 * @property string|null $variant
 * @property array<string, mixed>|null $settings
 * @property int $position
 * @property bool $is_active
 * @property-read Page $page
 * @property-read Collection<int, PageBlock> $blocks
 * @property-read Collection<int, PageBlock> $allBlocks
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read int|null $all_blocks_count
 * @property-read int|null $blocks_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PageSection newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PageSection newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PageSection query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PageSection whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PageSection whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PageSection whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PageSection whereLayout($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PageSection wherePageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PageSection wherePosition($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PageSection whereSectionType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PageSection whereSettings($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PageSection whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PageSection whereVariant($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'page_id', 'section_type', 'layout', 'variant', 'settings', 'position', 'is_active',
])]
#[Table(name: 'page_sections')]
class PageSection extends Model
{
    use HasFactory;

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class, 'page_id');
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(PageBlock::class, 'section_id')->where('is_active', true)->orderBy('position');
    }

    public function allBlocks(): HasMany
    {
        return $this->hasMany(PageBlock::class, 'section_id')->orderBy('position');
    }
}
