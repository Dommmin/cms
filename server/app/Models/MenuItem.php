<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\MenuLinkTypeEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'menu_id', 'parent_id', 'label', 'url', 'target',
    'link_type', 'linked_entity_id', 'icon', 'is_active', 'position',
])]
#[Table(name: 'menu_items')]
class MenuItem extends Model
{
    use HasFactory;

    public function getLocalizedLabel(string $locale = 'en'): string
    {
        $labels = $this->label ?? [];

        return $labels[$locale] ?? $labels['en'] ?? (string) reset($labels);
    }

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->where('is_active', true)->orderBy('position');
    }

    /** Oblicza final URL na podstawie link_type z uwzględnieniem locale. */
    public function resolvedUrl(string $locale = 'en'): string
    {
        return match ($this->link_type) {
            MenuLinkTypeEnum::Category => '/products?category='.Category::query()->find($this->linked_entity_id)?->slug,
            MenuLinkTypeEnum::Product => '/products/'.Product::query()->find($this->linked_entity_id)?->slug,
            MenuLinkTypeEnum::Page => '/'.Page::query()->find($this->linked_entity_id)?->getSlugForLocale($locale),
            default => $this->url ?? '#',
        };
    }

    protected function casts(): array
    {
        return [
            'label' => 'array',
            'link_type' => MenuLinkTypeEnum::class,
            'is_active' => 'boolean',
        ];
    }
}
