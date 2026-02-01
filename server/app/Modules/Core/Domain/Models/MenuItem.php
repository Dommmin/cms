<?php

declare(strict_types=1);

namespace App\Modules\Core\Domain\Models;

use App\Enums\MenuLinkType;
use App\Modules\Ecommerce\Domain\Models\Category;
use App\Modules\Ecommerce\Domain\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class MenuItem extends Model
{
    protected $table = 'menu_items';

    protected $fillable = [
        'menu_id', 'parent_id', 'label', 'url', 'target',
        'link_type', 'linked_entity_id', 'icon', 'is_active', 'position',
    ];

    protected $casts = [
        'link_type' => MenuLinkType::class,
        'is_active' => 'boolean',
    ];

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

    /** Oblicza final URL na podstawie link_type */
    public function resolvedUrl(): string
    {
        return match($this->link_type) {
            MenuLinkType::Category   => '/category/' . Category::find($this->linked_entity_id)?->slug,
            MenuLinkType::Product    => '/products/' . Product::find($this->linked_entity_id)?->slug,
            MenuLinkType::StaticPage => '/' . StaticPage::find($this->linked_entity_id)?->slug,
            default                  => $this->url ?? '#',
        };
    }
}

