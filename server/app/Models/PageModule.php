<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $key
 * @property string $name
 * @property string|null $icon
 * @property string|null $description
 * @property bool $has_list_page
 * @property bool $has_detail_page
 * @property string|null $list_route_pattern
 * @property string|null $detail_route_pattern
 * @property string|null $model_class
 * @property string $route_key_name
 * @property bool $is_active
 * @property bool $is_system
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, ModuleLayout> $activeLayouts
 * @property-read int|null $active_layouts_count
 * @property-read Collection<int, ModuleLayout> $detailLayouts
 * @property-read int|null $detail_layouts_count
 * @property-read Collection<int, ModuleLayout> $layouts
 * @property-read int|null $layouts_count
 * @property-read Collection<int, ModuleLayout> $listLayouts
 * @property-read int|null $list_layouts_count
 * @property-read Collection<int, Page> $pages
 * @property-read int|null $pages_count
 *
 * @method static Builder<static>|PageModule newModelQuery()
 * @method static Builder<static>|PageModule newQuery()
 * @method static Builder<static>|PageModule query()
 * @method static Builder<static>|PageModule whereCreatedAt($value)
 * @method static Builder<static>|PageModule whereDescription($value)
 * @method static Builder<static>|PageModule whereDetailRoutePattern($value)
 * @method static Builder<static>|PageModule whereHasDetailPage($value)
 * @method static Builder<static>|PageModule whereHasListPage($value)
 * @method static Builder<static>|PageModule whereIcon($value)
 * @method static Builder<static>|PageModule whereId($value)
 * @method static Builder<static>|PageModule whereIsActive($value)
 * @method static Builder<static>|PageModule whereIsSystem($value)
 * @method static Builder<static>|PageModule whereKey($value)
 * @method static Builder<static>|PageModule whereListRoutePattern($value)
 * @method static Builder<static>|PageModule whereModelClass($value)
 * @method static Builder<static>|PageModule whereName($value)
 * @method static Builder<static>|PageModule whereRouteKeyName($value)
 * @method static Builder<static>|PageModule whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'key',
    'name',
    'icon',
    'description',
    'has_list_page',
    'has_detail_page',
    'list_route_pattern',
    'detail_route_pattern',
    'model_class',
    'route_key_name',
    'is_active',
    'is_system',
])]
class PageModule extends Model
{
    use HasFactory;

    public function layouts(): HasMany
    {
        return $this->hasMany(ModuleLayout::class);
    }

    public function activeLayouts(): HasMany
    {
        return $this->layouts()->where('is_active', true);
    }

    public function listLayouts(): HasMany
    {
        return $this->activeLayouts()->where('type', 'list');
    }

    public function detailLayouts(): HasMany
    {
        return $this->activeLayouts()->where('type', 'detail');
    }

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class, 'page_module_id');
    }

    /**
     * Get model instance if model_class is set
     */
    public function getModelInstance(): ?Model
    {
        if (! $this->model_class || ! class_exists($this->model_class)) {
            return null;
        }

        return new $this->model_class;
    }

    /**
     * Generate detail URL for a given model instance
     */
    public function generateDetailUrl(Model $model): ?string
    {
        if (! $this->has_detail_page || ! $this->detail_route_pattern) {
            return null;
        }

        $routeKey = $model->{$this->route_key_name} ?? null;

        if (! $routeKey) {
            return null;
        }

        // Replace {slug}, {id}, etc. in pattern
        return str_replace(
            ['{slug}', '{id}', sprintf('{%s}', $this->route_key_name)],
            $routeKey,
            $this->detail_route_pattern
        );
    }

    protected function casts(): array
    {
        return [
            'has_list_page' => 'boolean',
            'has_detail_page' => 'boolean',
            'is_active' => 'boolean',
            'is_system' => 'boolean',
        ];
    }
}
