<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\MenuLinkTypeEnum;
use App\Enums\MenuLocationEnum;
use App\Models\ContentEntry;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use Illuminate\Support\Arr;
use RuntimeException;

class PagePresetService
{
    public function createFromPreset(string $presetKey): Page
    {
        $preset = config("cms.page_presets.{$presetKey}");
        if (! $preset) {
            throw new RuntimeException('Nie znaleziono presetu.');
        }

        $pageData = Arr::get($preset, 'page', []);
        $slugService = app(PageSlugService::class);
        $pageType = $pageData['page_type'] ?? 'blocks';
        $moduleName = $pageData['module_name'] ?? null;
        $moduleConfig = null;

        if ($pageType === 'module' && $moduleName === 'content') {
            $entry = ContentEntry::create([
                'name' => $pageData['title'] ?? ($preset['label'] ?? 'Nowa strona'),
                'content' => $pageData['content'] ?? '',
                'is_active' => true,
            ]);
            $moduleConfig = ['content_id' => $entry->id];
        }

        $page = Page::create([
            'title' => $pageData['title'] ?? ($preset['label'] ?? 'Nowa strona'),
            'slug' => $pageData['slug'] ?? $slugService->uniqueSlug($pageData['title'] ?? ($preset['label'] ?? 'Nowa strona')),
            'page_type' => $pageType,
            'module_name' => $moduleName,
            'module_config' => $moduleConfig,
            'layout' => $pageData['layout'] ?? 'default',
            'is_published' => false,
        ]);

        $sectionsPresetKeys = Arr::get($preset, 'sections', []);
        if (! empty($sectionsPresetKeys)) {
            $sections = [];
            foreach ($sectionsPresetKeys as $key) {
                $sectionPreset = config("cms.section_presets.{$key}");
                if (! $sectionPreset) {
                    continue;
                }

                $sections[] = [
                    'layout' => $sectionPreset['section']['layout'] ?? 'default',
                    'variant' => $sectionPreset['section']['variant'] ?? null,
                    'settings' => $sectionPreset['section']['settings'] ?? null,
                    'is_active' => true,
                    'blocks' => $sectionPreset['blocks'] ?? [],
                ];
            }

            $page->update([
                'builder_snapshot' => [
                    'sections' => $sections,
                ],
            ]);
        }

        $children = Arr::get($preset, 'children', []);
        $childPages = [];
        foreach ($children as $child) {
            $childPageType = $child['page_type'] ?? 'blocks';
            $childModuleName = $child['module_name'] ?? null;
            $childModuleConfig = null;

            if ($childPageType === 'module' && $childModuleName === 'content') {
                $entry = ContentEntry::create([
                    'name' => $child['title'],
                    'content' => $child['content'] ?? '',
                    'is_active' => true,
                ]);
                $childModuleConfig = ['content_id' => $entry->id];
            } elseif (isset($child['content']) && $child['content'] !== '') {
                $childPageType = 'module';
                $childModuleName = 'content';
                $entry = ContentEntry::create([
                    'name' => $child['title'],
                    'content' => $child['content'],
                    'is_active' => true,
                ]);
                $childModuleConfig = ['content_id' => $entry->id];
            }

            $childPages[] = Page::create([
                'parent_id' => $page->id,
                'title' => $child['title'],
                'slug' => $child['slug'] ?? $slugService->uniqueSlug($child['title'], $page->id),
                'page_type' => $childPageType,
                'module_name' => $childModuleName,
                'module_config' => $childModuleConfig,
                'layout' => $child['layout'] ?? 'default',
                'content' => null,
                'is_published' => false,
            ]);
        }

        $menuConfig = Arr::get($preset, 'menu');
        if (is_array($menuConfig) && ! empty($menuConfig['location'])) {
            $location = MenuLocationEnum::tryFrom($menuConfig['location']);
            if ($location) {
                $menu = Menu::query()->firstOrCreate(
                    ['location' => $location->value],
                    ['name' => $location->label(), 'is_active' => true]
                );

                if (! empty($menuConfig['include_children']) && ! empty($childPages)) {
                    foreach ($childPages as $index => $childPage) {
                        MenuItem::create([
                            'menu_id' => $menu->id,
                            'label' => $childPage->title,
                            'link_type' => MenuLinkTypeEnum::Page->value,
                            'linked_entity_id' => $childPage->id,
                            'position' => $index,
                            'is_active' => true,
                        ]);
                    }
                }
            }
        }

        return $page;
    }
}
