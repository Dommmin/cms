<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Page;
use App\Models\Theme;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use RuntimeException;

class StarterKitService
{
    public function __construct(
        private readonly PageSlugService $slugService
    ) {}

    public function applyKit(string $kitKey): array
    {
        $kit = config('cms.starter_kits.'.$kitKey);
        throw_unless($kit, RuntimeException::class, sprintf('Starter Kit [%s] not found.', $kitKey));

        $presetKey = Arr::get($kit, 'design_preset', 'minimal');
        $designPreset = config('cms.design_presets.'.$presetKey);

        $theme = null;
        if ($designPreset) {
            // Unset current active themes
            Theme::query()->update(['is_active' => false]);

            $theme = Theme::query()->create([
                'name' => $kit['label'].' Theme',
                'slug' => Str::slug($kit['label'].' '.uniqid()),
                'tokens' => $designPreset['tokens'] ?? null,
                'typography' => $designPreset['typography'] ?? null,
                'spacing' => $designPreset['spacing'] ?? null,
                'buttons' => $designPreset['buttons'] ?? null,
                'containers' => $designPreset['containers'] ?? null,
                'is_active' => true,
            ]);
        }

        $pagesCreated = [];
        $pages = Arr::get($kit, 'pages', []);

        foreach ($pages as $pageData) {
            $sections = [];
            foreach (Arr::get($pageData, 'sections', []) as $sectionData) {
                $blocks = [];
                foreach (Arr::get($sectionData, 'blocks', []) as $blockData) {
                    $blocks[] = [
                        'id' => Str::uuid()->toString(),
                        'type' => $blockData['type'],
                        'configuration' => $blockData['configuration'] ?? [],
                    ];
                }

                $sections[] = [
                    'id' => Str::uuid()->toString(),
                    'layout' => $sectionData['layout'] ?? 'default',
                    'variant' => $sectionData['variant'] ?? 'default',
                    'is_active' => true,
                    'blocks' => $blocks,
                ];
            }

            $page = Page::query()->create([
                'title' => $pageData['title'],
                'slug' => $pageData['slug'] ?? $this->slugService->uniqueSlug($pageData['title']),
                'page_type' => $pageData['page_type'] ?? 'blocks',
                'layout' => $pageData['layout'] ?? 'default',
                'system_page_key' => $pageData['system_page_key'] ?? null,
                'is_published' => true,
                'theme_id' => $theme?->id,
                'builder_snapshot' => [
                    'sections' => $sections,
                ],
            ]);

            $pagesCreated[] = $page;
        }

        return [
            'theme' => $theme,
            'pages' => $pagesCreated,
        ];
    }
}
