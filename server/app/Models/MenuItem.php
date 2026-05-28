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

/**
 * @property int $id
 * @property int $menu_id
 * @property int|null $parent_id
 * @property array<array-key, mixed>|null $label
 * @property string|null $url
 * @property string $target
 * @property MenuLinkTypeEnum $link_type
 * @property int|null $linked_entity_id
 * @property string|null $icon
 * @property bool $is_active
 * @property int $position
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, MenuItem> $children
 * @property-read int|null $children_count
 * @property-read \App\Models\Menu $menu
 * @property-read MenuItem|null $parent
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereIcon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereLinkType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereLinkedEntityId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereMenuId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereParentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem wherePosition($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereTarget($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MenuItem whereUrl($value)
 * @mixin \Eloquent
 */
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
