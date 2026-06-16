<?php

declare(strict_types=1);

use App\Enums\PageBlockTypeEnum;
use App\Models\BlockRelation;
use App\Models\BlogPost;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Form;
use App\Models\Page;
use App\Models\Product;
use Database\Seeders\FormSeeder;
use Database\Seeders\PageBuilderShowcaseSeeder;
use Illuminate\Support\Facades\Config;

beforeEach(function (): void {
    Config::set('modules.ecommerce', true);

    $this->seed(FormSeeder::class);

    Product::factory()->count(4)->create([
        'is_active' => true,
        'is_saleable' => true,
    ]);

    Category::factory()->count(4)->create([
        'parent_id' => null,
    ]);

    foreach (range(1, 3) as $position) {
        Brand::query()->create([
            'name' => "Showcase Brand {$position}",
            'slug' => "showcase-brand-{$position}",
            'is_active' => true,
            'position' => $position,
        ]);
    }

    BlogPost::factory()->count(3)->published()->create();
});

it('seeds the page builder showcase with every block type', function (): void {
    $this->seed(PageBuilderShowcaseSeeder::class);

    $page = Page::query()
        ->where('slug->en', 'page-builder-showcase')
        ->whereNull('locale')
        ->first();

    expect($page)->not->toBeNull()
        ->and($page?->page_type->value)->toBe('blocks')
        ->and($page?->is_published)->toBeTrue();

    $blockTypes = $page->allBlocks()
        ->get()
        ->map(fn ($block) => $block->type->value)
        ->unique()
        ->sort()
        ->values()
        ->all();

    $expected = array_map(
        static fn (PageBlockTypeEnum $case): string => $case->value,
        PageBlockTypeEnum::cases(),
    );

    expect($blockTypes)->toEqualCanonicalizing($expected)
        ->and($page->allSections()->count())->toBe(6)
        ->and(BlockRelation::query()->whereIn('page_block_id', $page->allBlocks()->pluck('id'))->count())->toBeGreaterThan(0);

    expect(Form::query()->where('slug', 'contact')->exists())->toBeTrue();
});

it('is idempotent when run twice', function (): void {
    $this->seed(PageBuilderShowcaseSeeder::class);
    $this->seed(PageBuilderShowcaseSeeder::class);

    $page = Page::query()
        ->where('slug->en', 'page-builder-showcase')
        ->whereNull('locale')
        ->firstOrFail();

    expect($page->allBlocks()->count())->toBe(30);
});
