<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $page_module_id
 * @property string $key
 * @property string $name
 * @property string $type
 * @property string $component_name
 * @property string|null $preview_image
 * @property array|null $configuration_schema
 * @property array|null $default_configuration
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\PageModule $module
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Page> $pages
 * @property-read int|null $pages_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModuleLayout newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModuleLayout newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModuleLayout query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModuleLayout whereComponentName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModuleLayout whereConfigurationSchema($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModuleLayout whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModuleLayout whereDefaultConfiguration($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModuleLayout whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModuleLayout whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModuleLayout whereKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModuleLayout whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModuleLayout wherePageModuleId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModuleLayout wherePreviewImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModuleLayout whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ModuleLayout whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'page_module_id',
    'key',
    'name',
    'type',
    'component_name',
    'preview_image',
    'configuration_schema',
    'default_configuration',
    'is_active',
])]
class ModuleLayout extends Model
{
    use HasFactory;

    protected $casts = [
        'configuration_schema' => 'array',
        'default_configuration' => 'array',
        'is_active' => 'boolean',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(PageModule::class, 'page_module_id');
    }

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class, 'module_layout_id');
    }
}
