<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
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

    protected $casts = [
        'has_list_page' => 'boolean',
        'has_detail_page' => 'boolean',
        'is_active' => 'boolean',
        'is_system' => 'boolean',
    ];

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
}
