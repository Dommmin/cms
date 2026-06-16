<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Page;
use App\Models\PageBlock;
use App\Models\PageSection;
use Illuminate\Database\Seeder;

class ThemeShowcaseSeeder extends Seeder
{
    private const string PAGE_SLUG = 'theme-showcase';

    /** @var list<string> */
    private const array SHOWCASE_GROUPS = [
        'typography',
        'buttons',
        'cards',
        'surfaces',
        'spacing',
        'colors',
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
            'title' => ['en' => 'Theme Showcase', 'pl' => 'Theme Showcase'],
            'slug' => array_merge($page->getTranslations('slug'), ['en' => self::PAGE_SLUG, 'pl' => self::PAGE_SLUG]),
            'locale' => null,
            'page_type' => 'blocks',
            'is_published' => true,
            'published_at' => now(),
            'position' => 101,
            'sitemap_exclude' => true,
            'seo_title' => 'Theme Showcase — Design System Tokens',
            'seo_description' => 'Visual reference page for typography, buttons, cards, surfaces, spacing, and color tokens.',
            'excerpt' => ['en' => 'Regression checklist for the active storefront theme and design tokens.'],
            'og_image' => '/demo/pages/home.svg',
        ]);
        $page->save();

        return $page;
    }

    private function seedGroupSection(Page $page, string $group, int $position): void
    {
        $section = $this->section($page, 'standard', 'contained', 'light', [
            'padding' => 'xl',
            'animation' => 'fade-up',
            'showcase_group' => $group,
        ], $position);

        $demo = match ($group) {
            'typography' => $this->typographyDemo(),
            'buttons' => $this->buttonsDemo(),
            'cards' => $this->cardsDemo(),
            'surfaces' => $this->surfacesDemo(),
            'spacing' => $this->spacingDemo(),
            'colors' => $this->colorsDemo(),
            default => throw new \InvalidArgumentException("Unknown showcase group [{$group}]."),
        };

        $this->block($page, $section, 'custom_html', $demo, 1);
    }

    /**
     * @return array{html: string, css: string}
     */
    private function typographyDemo(): array
    {
        return [
            'html' => <<<'HTML'
<div class="ts">
  <header class="ts-intro">
    <p class="ts-eyebrow">Design system</p>
    <h2 class="ts-title">Typography</h2>
    <p class="ts-lead">Heading and body fonts, base size, and modular scale from theme tokens.</p>
  </header>
  <div class="ts-stack">
    <div class="ts-type-row">
      <span class="ts-meta">H1 · var(--h1-size)</span>
      <h1 class="ts-h1">The quick brown fox</h1>
    </div>
    <div class="ts-type-row">
      <span class="ts-meta">H2 · var(--h2-size)</span>
      <h2 class="ts-h2">Jumps over the lazy dog</h2>
    </div>
    <div class="ts-type-row">
      <span class="ts-meta">H3 · var(--h3-size)</span>
      <h3 class="ts-h3">Pack my box with five dozen liquor jugs</h3>
    </div>
    <div class="ts-type-row">
      <span class="ts-meta">H4 · var(--h4-size)</span>
      <h4 class="ts-h4">Sphinx of black quartz, judge my vow</h4>
    </div>
    <div class="ts-type-row">
      <span class="ts-meta">Body · var(--text-base-size)</span>
      <p class="ts-body">Body copy uses <strong>var(--font-body)</strong> at the configured base size. Merchants can swap heading and body families without touching block markup.</p>
    </div>
    <div class="ts-type-row">
      <span class="ts-meta">Muted</span>
      <p class="ts-muted">Supporting text, captions, and helper labels use muted foreground for hierarchy.</p>
    </div>
  </div>
</div>
HTML,
            'css' => $this->sharedCss().<<<'CSS'

.ts-type-row { display: grid; gap: 0.35rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border); }
.ts-type-row:last-child { border-bottom: 0; padding-bottom: 0; }
.ts-meta { font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted-foreground); }
.ts-h1 { margin: 0; font-family: var(--font-heading); font-size: var(--h1-size, 2.5rem); font-weight: 700; line-height: 1.1; }
.ts-h2 { margin: 0; font-family: var(--font-heading); font-size: var(--h2-size, 2rem); font-weight: 700; line-height: 1.15; }
.ts-h3 { margin: 0; font-family: var(--font-heading); font-size: var(--h3-size, 1.5rem); font-weight: 600; line-height: 1.2; }
.ts-h4 { margin: 0; font-family: var(--font-heading); font-size: var(--h4-size, 1.25rem); font-weight: 600; line-height: 1.25; }
.ts-body { margin: 0; font-family: var(--font-body); font-size: var(--text-base-size, 1rem); line-height: 1.7; color: var(--foreground); }
.ts-muted { margin: 0; font-family: var(--font-body); font-size: 0.9375rem; line-height: 1.6; color: var(--muted-foreground); }
CSS,
        ];
    }

    /**
     * @return array{html: string, css: string}
     */
    private function buttonsDemo(): array
    {
        return [
            'html' => <<<'HTML'
<div class="ts">
  <header class="ts-intro">
    <p class="ts-eyebrow">Design system</p>
    <h2 class="ts-title">Buttons</h2>
    <p class="ts-lead">Primary and secondary padding and radius tokens applied to storefront CTAs.</p>
  </header>
  <div class="ts-btn-grid">
    <div class="ts-btn-col">
      <span class="ts-meta">Primary</span>
      <button type="button" class="ts-btn ts-btn-primary">Primary action</button>
    </div>
    <div class="ts-btn-col">
      <span class="ts-meta">Secondary</span>
      <button type="button" class="ts-btn ts-btn-secondary">Secondary action</button>
    </div>
    <div class="ts-btn-col">
      <span class="ts-meta">Outline</span>
      <button type="button" class="ts-btn ts-btn-outline">Outline action</button>
    </div>
    <div class="ts-btn-col">
      <span class="ts-meta">Destructive</span>
      <button type="button" class="ts-btn ts-btn-destructive">Delete item</button>
    </div>
    <div class="ts-btn-col">
      <span class="ts-meta">Ghost / link</span>
      <button type="button" class="ts-btn ts-btn-ghost">Learn more</button>
    </div>
    <div class="ts-btn-col">
      <span class="ts-meta">Disabled</span>
      <button type="button" class="ts-btn ts-btn-primary" disabled>Unavailable</button>
    </div>
  </div>
</div>
HTML,
            'css' => $this->sharedCss().<<<'CSS'

.ts-btn-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr)); gap: var(--block-gap, 2rem); }
.ts-btn-col { display: grid; gap: 0.75rem; justify-items: start; }
.ts-btn {
  display: inline-flex; align-items: center; justify-content: center;
  font-family: var(--font-body); font-size: 0.9375rem; font-weight: 600;
  border: 1px solid transparent; transition: opacity 0.15s ease;
}
.ts-btn:hover:not(:disabled) { opacity: 0.9; }
.ts-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ts-btn-primary {
  background: var(--primary); color: var(--primary-foreground);
  border-radius: var(--btn-radius, 0.375rem);
  padding: var(--btn-padding-y, 0.625rem) var(--btn-padding-x, 1.5rem);
}
.ts-btn-secondary {
  background: var(--secondary); color: var(--secondary-foreground);
  border-radius: var(--btn-secondary-radius, var(--btn-radius, 0.375rem));
  padding: var(--btn-secondary-padding-y, 0.625rem) var(--btn-secondary-padding-x, 1.5rem);
}
.ts-btn-outline {
  background: transparent; color: var(--foreground); border-color: var(--border);
  border-radius: var(--btn-secondary-radius, var(--btn-radius, 0.375rem));
  padding: var(--btn-secondary-padding-y, 0.625rem) var(--btn-secondary-padding-x, 1.5rem);
}
.ts-btn-destructive {
  background: var(--destructive); color: var(--destructive-foreground, #fff);
  border-radius: var(--btn-radius, 0.375rem);
  padding: var(--btn-padding-y, 0.625rem) var(--btn-padding-x, 1.5rem);
}
.ts-btn-ghost {
  background: transparent; color: var(--primary);
  border-radius: var(--btn-radius, 0.375rem);
  padding: var(--btn-padding-y, 0.625rem) var(--btn-padding-x, 1.5rem);
  text-decoration: underline; text-underline-offset: 3px;
}
CSS,
        ];
    }

    /**
     * @return array{html: string, css: string}
     */
    private function cardsDemo(): array
    {
        return [
            'html' => <<<'HTML'
<div class="ts">
  <header class="ts-intro">
    <p class="ts-eyebrow">Design system</p>
    <h2 class="ts-title">Cards</h2>
    <p class="ts-lead">Elevated surfaces with card radius, border, and shadow tokens.</p>
  </header>
  <div class="ts-card-grid">
    <article class="ts-card">
      <div class="ts-card-header">Default card</div>
      <div class="ts-card-body">
        <p>Uses <code>--card</code>, <code>--card-foreground</code>, and <code>--store-card-radius</code>.</p>
      </div>
      <div class="ts-card-footer">
        <button type="button" class="ts-btn ts-btn-primary ts-btn-sm">Action</button>
      </div>
    </article>
    <article class="ts-card ts-card-muted">
      <div class="ts-card-header">Muted inset</div>
      <div class="ts-card-body">
        <p>Nested panels can sit on <code>--muted</code> while keeping readable foreground contrast.</p>
      </div>
    </article>
    <article class="ts-card ts-card-lifted">
      <div class="ts-card-header">Lifted shadow</div>
      <div class="ts-card-body">
        <p>Product tiles and promos use <code>--store-shadow-lifted</code> for depth without breaking tokens.</p>
      </div>
    </article>
  </div>
</div>
HTML,
            'css' => $this->sharedCss().<<<'CSS'

.ts-card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); gap: var(--block-gap, 2rem); }
.ts-card {
  display: flex; flex-direction: column; overflow: hidden;
  background: var(--card); color: var(--card-foreground);
  border: 1px solid var(--border);
  border-radius: var(--store-card-radius, var(--radius, 0.5rem));
  box-shadow: var(--store-shadow-soft);
}
.ts-card-muted .ts-card-body { background: var(--muted); }
.ts-card-lifted { box-shadow: var(--store-shadow-lifted); }
.ts-card-header { padding: 1rem 1.25rem; font-family: var(--font-heading); font-weight: 600; border-bottom: 1px solid var(--border); }
.ts-card-body { padding: 1.25rem; flex: 1; font-size: 0.9375rem; line-height: 1.6; }
.ts-card-body code { font-size: 0.8125rem; padding: 0.1rem 0.35rem; border-radius: calc(var(--radius, 0.5rem) - 2px); background: var(--muted); }
.ts-card-footer { padding: 1rem 1.25rem; border-top: 1px solid var(--border); }
.ts-btn-sm {
  border-radius: var(--btn-radius, 0.375rem);
  padding: calc(var(--btn-padding-y, 0.625rem) * 0.75) calc(var(--btn-padding-x, 1.5rem) * 0.75);
  font-size: 0.875rem;
}
CSS,
        ];
    }

    /**
     * @return array{html: string, css: string}
     */
    private function surfacesDemo(): array
    {
        return [
            'html' => <<<'HTML'
<div class="ts">
  <header class="ts-intro">
    <p class="ts-eyebrow">Design system</p>
    <h2 class="ts-title">Surfaces</h2>
    <p class="ts-lead">Section variants and semantic background layers used across the storefront.</p>
  </header>
  <div class="ts-surface-grid">
    <div class="ts-surface ts-surface-light"><span>Light · background</span></div>
    <div class="ts-surface ts-surface-muted"><span>Muted · muted</span></div>
    <div class="ts-surface ts-surface-brand"><span>Brand · primary</span></div>
    <div class="ts-surface ts-surface-dark"><span>Dark · section-dark</span></div>
    <div class="ts-surface ts-surface-popover"><span>Popover</span></div>
    <div class="ts-surface ts-surface-accent"><span>Accent</span></div>
  </div>
</div>
HTML,
            'css' => $this->sharedCss().<<<'CSS'

.ts-surface-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: var(--block-gap, 2rem); }
.ts-surface {
  min-height: 6.5rem; display: flex; align-items: flex-end; padding: 1rem;
  border-radius: var(--store-card-radius, var(--radius, 0.5rem));
  border: 1px solid var(--border); font-size: 0.8125rem; font-weight: 600;
}
.ts-surface-light { background: var(--background); color: var(--foreground); }
.ts-surface-muted { background: var(--muted); color: var(--foreground); }
.ts-surface-brand { background: var(--primary); color: var(--primary-foreground); border-color: transparent; }
.ts-surface-dark { background: var(--section-dark-bg, var(--foreground)); color: var(--section-dark-text, var(--background)); border-color: transparent; }
.ts-surface-popover { background: var(--popover); color: var(--popover-foreground); box-shadow: var(--store-shadow-soft); }
.ts-surface-accent { background: var(--accent); color: var(--accent-foreground); border-color: transparent; }
CSS,
        ];
    }

    /**
     * @return array{html: string, css: string}
     */
    private function spacingDemo(): array
    {
        return [
            'html' => <<<'HTML'
<div class="ts">
  <header class="ts-intro">
    <p class="ts-eyebrow">Design system</p>
    <h2 class="ts-title">Spacing</h2>
    <p class="ts-lead">Section padding, block gap, and container padding from theme spacing tokens.</p>
  </header>
  <div class="ts-spacing-stack">
    <div class="ts-spacing-row">
      <span class="ts-meta">Section padding · var(--section-padding-y)</span>
      <div class="ts-spacing-demo ts-spacing-section"><span>5rem token</span></div>
    </div>
    <div class="ts-spacing-row">
      <span class="ts-meta">Block gap · var(--block-gap)</span>
      <div class="ts-spacing-demo ts-spacing-gap">
        <span>A</span><span>B</span><span>C</span>
      </div>
    </div>
    <div class="ts-spacing-row">
      <span class="ts-meta">Container padding · var(--container-padding)</span>
      <div class="ts-spacing-demo ts-spacing-container">
        <div class="ts-spacing-inner">Content inset</div>
      </div>
    </div>
  </div>
</div>
HTML,
            'css' => $this->sharedCss().<<<'CSS'

.ts-spacing-stack { display: grid; gap: var(--block-gap, 2rem); }
.ts-spacing-row { display: grid; gap: 0.75rem; }
.ts-spacing-demo { border: 1px dashed var(--border); border-radius: var(--radius, 0.5rem); background: var(--muted); }
.ts-spacing-section {
  padding-block: var(--section-padding-y, 5rem);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.875rem; font-weight: 600; color: var(--muted-foreground);
}
.ts-spacing-gap {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--block-gap, 2rem); padding: 1rem;
}
.ts-spacing-gap span {
  display: grid; place-items: center; min-height: 3rem;
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--store-card-radius, var(--radius, 0.5rem));
  font-weight: 600; font-size: 0.875rem;
}
.ts-spacing-container { padding: var(--container-padding, 1.5rem); }
.ts-spacing-inner {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--store-card-radius, var(--radius, 0.5rem));
  padding: 1rem; text-align: center; font-size: 0.875rem; font-weight: 600;
}
CSS,
        ];
    }

    /**
     * @return array{html: string, css: string}
     */
    private function colorsDemo(): array
    {
        return [
            'html' => <<<'HTML'
<div class="ts">
  <header class="ts-intro">
    <p class="ts-eyebrow">Design system</p>
    <h2 class="ts-title">Colors</h2>
    <p class="ts-lead">Semantic palette tokens — swap the active theme to verify contrast and brand alignment.</p>
  </header>
  <div class="ts-swatch-grid">
    <div class="ts-swatch"><span class="ts-swatch-chip ts-swatch-primary"></span><span class="ts-swatch-label">primary</span></div>
    <div class="ts-swatch"><span class="ts-swatch-chip ts-swatch-secondary"></span><span class="ts-swatch-label">secondary</span></div>
    <div class="ts-swatch"><span class="ts-swatch-chip ts-swatch-muted"></span><span class="ts-swatch-label">muted</span></div>
    <div class="ts-swatch"><span class="ts-swatch-chip ts-swatch-accent"></span><span class="ts-swatch-label">accent</span></div>
    <div class="ts-swatch"><span class="ts-swatch-chip ts-swatch-destructive"></span><span class="ts-swatch-label">destructive</span></div>
    <div class="ts-swatch"><span class="ts-swatch-chip ts-swatch-border"></span><span class="ts-swatch-label">border</span></div>
    <div class="ts-swatch"><span class="ts-swatch-chip ts-swatch-ring"></span><span class="ts-swatch-label">ring</span></div>
    <div class="ts-swatch"><span class="ts-swatch-chip ts-swatch-chart-1"></span><span class="ts-swatch-label">chart-1</span></div>
    <div class="ts-swatch"><span class="ts-swatch-chip ts-swatch-chart-2"></span><span class="ts-swatch-label">chart-2</span></div>
    <div class="ts-swatch"><span class="ts-swatch-chip ts-swatch-chart-3"></span><span class="ts-swatch-label">chart-3</span></div>
    <div class="ts-swatch"><span class="ts-swatch-chip ts-swatch-chart-4"></span><span class="ts-swatch-label">chart-4</span></div>
    <div class="ts-swatch"><span class="ts-swatch-chip ts-swatch-chart-5"></span><span class="ts-swatch-label">chart-5</span></div>
  </div>
</div>
HTML,
            'css' => $this->sharedCss().<<<'CSS'

.ts-swatch-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(6.5rem, 1fr)); gap: var(--block-gap, 2rem); }
.ts-swatch { display: grid; gap: 0.5rem; justify-items: center; text-align: center; }
.ts-swatch-chip {
  width: 4.5rem; height: 4.5rem; border-radius: var(--store-card-radius, var(--radius, 0.5rem));
  border: 1px solid var(--border); box-shadow: var(--store-shadow-soft);
}
.ts-swatch-label { font-size: 0.75rem; color: var(--muted-foreground); font-family: ui-monospace, monospace; }
.ts-swatch-primary { background: var(--primary); }
.ts-swatch-secondary { background: var(--secondary); }
.ts-swatch-muted { background: var(--muted); }
.ts-swatch-accent { background: var(--accent); }
.ts-swatch-destructive { background: var(--destructive); }
.ts-swatch-border { background: var(--border); }
.ts-swatch-ring { background: var(--ring); }
.ts-swatch-chart-1 { background: var(--chart-1); }
.ts-swatch-chart-2 { background: var(--chart-2); }
.ts-swatch-chart-3 { background: var(--chart-3); }
.ts-swatch-chart-4 { background: var(--chart-4); }
.ts-swatch-chart-5 { background: var(--chart-5); }
CSS,
        ];
    }

    private function sharedCss(): string
    {
        return <<<'CSS'
.ts { display: grid; gap: var(--block-gap, 2rem); }
.ts-intro { display: grid; gap: 0.5rem; max-width: var(--container-content-width, 48rem); }
.ts-eyebrow { margin: 0; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--primary); font-weight: 600; }
.ts-title { margin: 0; font-family: var(--font-heading); font-size: var(--h2-size, 2rem); font-weight: 700; line-height: 1.15; }
.ts-lead { margin: 0; font-size: 1rem; line-height: 1.6; color: var(--muted-foreground); }
.ts-stack { display: grid; gap: 1.25rem; }
.ts-meta { font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted-foreground); }
CSS;
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

    /**
     * @param  array<string, mixed>  $configuration
     */
    private function block(
        Page $page,
        PageSection $section,
        string $type,
        array $configuration,
        int $position,
    ): PageBlock {
        return PageBlock::query()->create([
            'page_id' => $page->id,
            'section_id' => $section->id,
            'type' => $type,
            'configuration' => $configuration,
            'position' => $position,
            'is_active' => true,
        ]);
    }

    private function assertAllShowcaseGroupsPresent(Page $page): void
    {
        $actual = $page->allSections()
            ->get()
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
            throw new \RuntimeException('Theme Showcase is missing groups: '.implode(', ', $missing));
        }
    }

    private function printSummary(Page $page): void
    {
        if (! $this->command) {
            return;
        }

        $page->load(['allSections.allBlocks']);

        $this->command->info('Theme Showcase seeded successfully.');
        $this->command->table(
            ['Record', 'Details'],
            [
                ['Page', "ID {$page->id} · slug /".self::PAGE_SLUG],
                ['Sections', (string) $page->allSections->count()],
                ['Blocks', (string) $page->allBlocks->count()],
                ['Groups', implode(', ', self::SHOWCASE_GROUPS)],
            ],
        );
    }
}
