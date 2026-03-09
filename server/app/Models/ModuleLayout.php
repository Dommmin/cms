<?php

declare(strict_types=1);

namespace App\Models;

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
 */
class ModuleLayout extends Model
{
    protected $fillable = [
        'page_module_id',
        'key',
        'name',
        'type',
        'component_name',
        'preview_image',
        'configuration_schema',
        'default_configuration',
        'is_active',
    ];

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
