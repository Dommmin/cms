<?php

declare(strict_types=1);

use App\Models\Page;
use App\Services\PageBuilderRulesService;
use Tests\TestCase;

uses(TestCase::class);

it('enforces max_per_page using block_type config keys', function (): void {
    $page = Page::factory()->make([
        'builder_snapshot' => [
            'sections' => [
                [
                    'blocks' => [
                        ['type' => 'hero_banner'],
                        ['type' => 'hero_banner'],
                    ],
                ],
            ],
        ],
    ]);

    $service = new PageBuilderRulesService();

    expect(fn () => $service->enforce($page))
        ->toThrow(RuntimeException::class);
});

it('allows blocks within business rule limits', function (): void {
    $page = Page::factory()->make([
        'builder_snapshot' => [
            'sections' => [
                [
                    'blocks' => [
                        ['type' => 'rich_text'],
                        ['type' => 'rich_text'],
                    ],
                ],
            ],
        ],
    ]);

    new PageBuilderRulesService()->enforce($page);

    expect(true)->toBeTrue();
});
