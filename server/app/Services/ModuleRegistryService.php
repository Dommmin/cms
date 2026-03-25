<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ModuleLayout;
use App\Models\PageModule;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ModuleRegistryService
{
    private readonly Collection $modules;

    public function __construct()
    {
        $this->modules = collect();
    }

    /**
     * Register a page module programmatically
     */
    public function registerModule(string $key, array $config): void
    {
        $this->modules->put($key, $config);
    }

    /**
     * Sync registered modules to database
     */
    public function sync(): void
    {
        foreach ($this->modules as $key => $config) {
            DB::transaction(function () use ($key, $config): void {
                $module = PageModule::query()->updateOrCreate(['key' => $key], [
                    'name' => $config['name'],
                    'icon' => $config['icon'] ?? null,
                    'description' => $config['description'] ?? null,
                    'has_list_page' => $config['has_list_page'] ?? true,
                    'has_detail_page' => $config['has_detail_page'] ?? true,
                    'list_route_pattern' => $config['list_route_pattern'] ?? null,
                    'detail_route_pattern' => $config['detail_route_pattern'] ?? null,
                    'model_class' => $config['model_class'] ?? null,
                    'route_key_name' => $config['route_key_name'] ?? 'slug',
                    'is_system' => true,
                    'is_active' => true,
                ]);

                // Sync list layouts
                if (isset($config['list_layouts'])) {
                    foreach ($config['list_layouts'] as $layoutKey => $layoutConfig) {
                        ModuleLayout::query()->updateOrCreate([
                            'page_module_id' => $module->id,
                            'key' => $layoutKey,
                        ], [
                            'name' => $layoutConfig['name'],
                            'type' => 'list',
                            'component_name' => $layoutConfig['component'],
                            'preview_image' => $layoutConfig['preview_image'] ?? null,
                            'configuration_schema' => $layoutConfig['config_schema'] ?? null,
                            'default_configuration' => $layoutConfig['default_config'] ?? null,
                            'is_active' => true,
                        ]);
                    }
                }

                // Sync detail layouts
                if (isset($config['detail_layouts'])) {
                    foreach ($config['detail_layouts'] as $layoutKey => $layoutConfig) {
                        ModuleLayout::query()->updateOrCreate([
                            'page_module_id' => $module->id,
                            'key' => $layoutKey,
                        ], [
                            'name' => $layoutConfig['name'],
                            'type' => 'detail',
                            'component_name' => $layoutConfig['component'],
                            'preview_image' => $layoutConfig['preview_image'] ?? null,
                            'configuration_schema' => $layoutConfig['config_schema'] ?? null,
                            'default_configuration' => $layoutConfig['default_config'] ?? null,
                            'is_active' => true,
                        ]);
                    }
                }
            });
        }
    }

    /**
     * Get all available modules
     */
    public function all(): Collection
    {
        return PageModule::with('activeLayouts')
            ->where('is_active', true)
            ->get();
    }

    /**
     * Get module by key
     */
    public function get(string $key): ?PageModule
    {
        return PageModule::with('activeLayouts')
            ->where('key', $key)
            ->where('is_active', true)
            ->first();
    }
}
