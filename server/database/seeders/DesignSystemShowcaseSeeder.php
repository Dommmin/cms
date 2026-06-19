<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Page;
use App\Models\PageSection;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;
use RuntimeException;

class DesignSystemShowcaseSeeder extends Seeder
{
    private const string PAGE_SLUG = 'design-system-showcase';

    /** @var list<string> */
    private const array SHOWCASE_GROUPS = [
        'typography',
        'containers',
        'sections',
        'stack_layouts',
        'grid_layouts',
        'surfaces',
        'buttons',
        'cards',
        'forms',
        'badges',
        'alerts',
        'prose',
        'colors',
        'spacing',
        'responsive',
    ];

    /** @var array<string, int> */
    private const array SHOWCASE_EXAMPLE_COUNTS = [
        'typography' => 12,
        'containers' => 4,
        'sections' => 5,
        'stack_layouts' => 5,
        'grid_layouts' => 4,
        'surfaces' => 4,
        'buttons' => 15,
        'cards' => 4,
        'forms' => 6,
        'badges' => 4,
        'alerts' => 4,
        'prose' => 1,
        'colors' => 28,
        'spacing' => 7,
        'responsive' => 3,
    ];

    public function run(): void
    {
        $page = $this->createPage();
        $page->allSections()->delete();
        $page->allBlocks()->delete();

        $position = 1;
        foreach (self::SHOWCASE_GROUPS as $group) {
            $this->seedGroupSection($page, $group, $position++);
        }

        $this->assertAllShowcaseGroupsPresent($page);
        $this->printSummary($page);
    }

    private function createPage(): Page
    {
        $page = Page::query()
            ->where('slug->en', self::PAGE_SLUG)
            ->whereNull('locale')
            ->first() ?? new Page;

        $page->fill([
            'parent_id' => null,
            'title' => ['en' => 'Design System Showcase', 'pl' => 'Design System Showcase'],
            'slug' => array_merge($page->getTranslations('slug'), ['en' => self::PAGE_SLUG, 'pl' => self::PAGE_SLUG]),
            'locale' => null,
            'page_type' => 'blocks',
            'is_published' => true,
            'published_at' => now(),
            'position' => 102,
            'sitemap_exclude' => true,
            'seo_title' => 'Design System Showcase — Base Components',
            'seo_description' => 'Visual reference for typography, layout primitives, UI controls, and design tokens used across the storefront.',
            'excerpt' => ['en' => 'Component-level documentation for composition and UI primitives — not page builder blocks or theme tokens.'],
            'og_image' => '/demo/pages/home.svg',
        ]);
        $page->save();

        return $page;
    }

    private function seedGroupSection(Page $page, string $group, int $position): void
    {
        $this->section($page, 'standard', 'contained', 'light', [
            'padding' => 'lg',
            'showcase_group' => $group,
        ], $position);
    }

    private function section(
        Page $page,
        string $type,
        string $layout,
        ?string $variant,
        array $settings,
        int $position,
    ): PageSection {
        return PageSection::query()->create([
            'page_id' => $page->id,
            'section_type' => $type,
            'layout' => $layout,
            'variant' => $variant,
            'settings' => $settings ?: null,
            'position' => $position,
            'is_active' => true,
        ]);
    }

    private function assertAllShowcaseGroupsPresent(Page $page): void
    {
        /** @var Collection<int, PageSection> $sections */
        $sections = $page->allSections()->get();
        $actual = $sections
            ->map(static fn (PageSection $section): ?string => is_array($section->settings)
                ? ($section->settings['showcase_group'] ?? null)
                : null)
            ->filter()
            ->unique()
            ->sort()
            ->values()
            ->all();

        $missing = array_values(array_diff(self::SHOWCASE_GROUPS, $actual));

        if ($missing !== []) {
            throw new RuntimeException('Design System Showcase is missing groups: '.implode(', ', $missing));
        }
    }

    private function printSummary(Page $page): void
    {
        if ($this->command === null) {
            return;
        }

        $exampleCount = array_sum(self::SHOWCASE_EXAMPLE_COUNTS);

        $this->command->info('Design System Showcase seeded successfully.');
        $this->command->table(
            ['Record', 'Details'],
            [
                ['Page ID', (string) $page->id],
                ['Slug', '/'.self::PAGE_SLUG],
                ['Sections', (string) $page->allSections()->count()],
                ['Showcase examples', (string) $exampleCount],
                ['Groups', implode(', ', self::SHOWCASE_GROUPS)],
            ],
        );
    }
}
