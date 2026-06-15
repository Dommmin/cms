<?php

declare(strict_types=1);

use App\Enums\BlockDataStrategy;
use App\Enums\PageBlockTypeEnum;
use App\Services\PageBuilder\BlockDefinition;
use Illuminate\Support\Facades\Config;

it('defines schema and data_strategy for every registered block type', function (): void {
    $blockTypes = config('blocks.block_types');

    expect($blockTypes)->toBeArray()->not->toBeEmpty();

    foreach (array_keys($blockTypes) as $type) {
        expect(BlockDefinition::getSchema($type))->toBeArray()->not->toBeEmpty()
            ->and(BlockDefinition::getDataStrategy($type))->toBeInstanceOf(BlockDataStrategy::class);
    }
});

it('maps every block type enum value to a valid contract', function (): void {
    foreach (PageBlockTypeEnum::cases() as $case) {
        expect(BlockDefinition::getDataStrategy($case->value))->toBeInstanceOf(BlockDataStrategy::class)
            ->and(BlockDefinition::getSchema($case->value))->toBeArray()
            ->and(BlockDefinition::getContextDependencies($case->value))->toBeArray();
    }
});

it('returns context dependencies declared in config', function (): void {
    expect(BlockDefinition::getContextDependencies('hero_banner'))->toBe([])
        ->and(BlockDefinition::getContextDependencies('featured_products'))
        ->toBe(['currentCategory', 'currentCollection']);
});

it('throws for unknown block types', function (): void {
    BlockDefinition::getSchema('nonexistent_block');
})->throws(InvalidArgumentException::class, 'Unknown block type [nonexistent_block].');

it('throws when schema is missing', function (): void {
    Config::set('blocks.block_types.invalid_block', [
        'data_strategy' => BlockDataStrategy::None,
    ]);

    BlockDefinition::getSchema('invalid_block');
})->throws(InvalidArgumentException::class, 'missing required field [schema]');

it('throws when data_strategy is missing', function (): void {
    Config::set('blocks.block_types.invalid_block', [
        'schema' => ['type' => 'object'],
    ]);

    BlockDefinition::getDataStrategy('invalid_block');
})->throws(InvalidArgumentException::class, 'missing required field [data_strategy]');

it('throws when data_strategy is invalid', function (): void {
    Config::set('blocks.block_types.invalid_block', [
        'schema' => ['type' => 'object'],
        'data_strategy' => 'not_a_strategy',
    ]);

    BlockDefinition::getDataStrategy('invalid_block');
})->throws(InvalidArgumentException::class, 'invalid data_strategy');
