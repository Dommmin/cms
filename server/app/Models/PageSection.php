<?php

declare(strict_types=1);

namespace App\Models;

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
 */
class PageSection extends Model
{
    use HasFactory;

    protected $table = 'page_sections';

    protected $fillable = [
        'page_id', 'section_type', 'layout', 'variant', 'settings', 'position', 'is_active',
    ];

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
