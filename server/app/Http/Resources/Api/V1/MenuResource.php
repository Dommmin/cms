<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\Menu;
use App\Models\MenuItem;
use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Menu
 */
class MenuResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Menu $menu */
        $menu = $this->resource;

        return [
            'id' => $menu->id,
            'name' => $menu->name,
            'location' => $menu->location instanceof BackedEnum ? $menu->location->value : $menu->location,
            'items' => $menu->relationLoaded('items') ? $this->mapItems($menu->items->whereNull('parent_id')) : [],
        ];
    }

    private function mapItems(\Illuminate\Support\Collection $items): array
    {
        $locale = request()->cookie('locale', request()->query('locale', 'en'));

        return $items->values()->map(fn (MenuItem $item) => [
            'id' => $item->id,
            'label' => $item->getLocalizedLabel($locale),
            'url' => $item->url,
            'target' => $item->target,
            'position' => $item->position,
            'children' => $item->relationLoaded('children') ? $this->mapItems($item->children) : [],
        ])->all();
    }
}
