<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\MenuLinkTypeEnum;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
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
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, MenuItem> $children
 * @property-read int|null $children_count
 * @property-read Menu $menu
 * @property-read MenuItem|null $parent
 *
 * @method static Builder<static>|MenuItem newModelQuery()
 * @method static Builder<static>|MenuItem newQuery()
 * @method static Builder<static>|MenuItem query()
 * @method static Builder<static>|MenuItem whereCreatedAt($value)
 * @method static Builder<static>|MenuItem whereIcon($value)
 * @method static Builder<static>|MenuItem whereId($value)
 * @method static Builder<static>|MenuItem whereIsActive($value)
 * @method static Builder<static>|MenuItem whereLabel($value)
 * @method static Builder<static>|MenuItem whereLinkType($value)
 * @method static Builder<static>|MenuItem whereLinkedEntityId($value)
 * @method static Builder<static>|MenuItem whereMenuId($value)
 * @method static Builder<static>|MenuItem whereParentId($value)
 * @method static Builder<static>|MenuItem wherePosition($value)
 * @method static Builder<static>|MenuItem whereTarget($value)
 * @method static Builder<static>|MenuItem whereUpdatedAt($value)
 * @method static Builder<static>|MenuItem whereUrl($value)
 *
 * @mixin Model
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
            MenuLinkTypeEnum::Page => $this->resolvePageUrl($locale),
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

    private function resolveLinkedPage(string $locale): ?Page
    {
        $page = Page::query()->find($this->linked_entity_id);

        if (! $page instanceof Page) {
            return null;
        }

        if ($page->system_page_key !== null) {
            return Page::findPublishedBySystemPageKey($page->system_page_key, $locale) ?? $page;
        }

        return $page;
    }

    private function resolvePageUrl(string $locale): string
    {
        $page = $this->resolveLinkedPage($locale);

        return $page instanceof Page ? '/'.$page->getSlugForLocale($locale) : ($this->url ?? '#');
    }
}
