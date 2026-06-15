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

it('keeps PageBlockTypeEnum and blocks registry in sync', function (): void {
    $registryKeys = array_keys(config('blocks.block_types', []));
    $enumValues = array_map(
        static fn (PageBlockTypeEnum $case): string => $case->value,
        PageBlockTypeEnum::cases(),
    );

    expect($registryKeys)->toEqualCanonicalizing($enumValues);
});

it('maps every block type enum value to registry entry with schema and data_strategy', function (): void {
    $registry = config('blocks.block_types');

    foreach (PageBlockTypeEnum::cases() as $case) {
        $type = $case->value;

        expect(array_key_exists($type, $registry))->toBeTrue(sprintf('missing registry entry for [%s]', $type))
            ->and(BlockDefinition::getSchema($type))->toBeArray()->not->toBeEmpty()
            ->and(BlockDefinition::getDataStrategy($type))->toBeInstanceOf(BlockDataStrategy::class)
            ->and(BlockDefinition::getContextDependencies($type))->toBeArray();
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
