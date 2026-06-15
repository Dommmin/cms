<?php

declare(strict_types=1);

use App\Enums\BlockDataStrategy;
use App\Enums\PageBlockTypeEnum;
use App\Services\PageBuilder\BlockValidationService;
use Illuminate\Support\Facades\Config;
use Illuminate\Validation\ValidationException;

it('validates every registered block type contract', function (): void {
    $service = resolve(BlockValidationService::class);

    foreach (PageBlockTypeEnum::cases() as $case) {
        expect($service->validate($case->value))->toBe([]);
    }
});

it('rejects unknown block types', function (): void {
    $errors = resolve(BlockValidationService::class)->validate('missing_block');

    expect($errors)->toContain('Block type [missing_block] is not registered.');
});

it('rejects missing schema in registry entry', function (): void {
    Config::set('blocks.block_types.invalid_block', [
        'data_strategy' => BlockDataStrategy::None->value,
        'context_dependencies' => [],
        'allowed_children' => null,
    ]);

    $errors = resolve(BlockValidationService::class)->validate('invalid_block');

    expect($errors)->toContain('Block type [invalid_block] is missing required field [schema].');
});

it('rejects missing data_strategy in registry entry', function (): void {
    Config::set('blocks.block_types.invalid_block', [
        'schema' => ['type' => 'object', 'properties' => []],
        'context_dependencies' => [],
        'allowed_children' => null,
    ]);

    $errors = resolve(BlockValidationService::class)->validate('invalid_block');

    expect($errors)->toContain('Block type [invalid_block] is missing required field [data_strategy].');
});

it('rejects invalid context dependencies', function (): void {
    Config::set('blocks.block_types.invalid_block', [
        'schema' => ['type' => 'object', 'properties' => []],
        'data_strategy' => BlockDataStrategy::None->value,
        'context_dependencies' => ['unknownContext'],
        'allowed_children' => null,
    ]);

    $errors = resolve(BlockValidationService::class)->validate('invalid_block');

    expect($errors)->toContain(
        'Block type [invalid_block] has invalid context dependency [unknownContext].',
    );
});

it('rejects invalid allowed_children references', function (): void {
    Config::set('blocks.block_types.invalid_block', [
        'schema' => ['type' => 'object', 'properties' => []],
        'data_strategy' => BlockDataStrategy::None->value,
        'context_dependencies' => [],
        'allowed_children' => ['not_a_real_block'],
    ]);

    $errors = resolve(BlockValidationService::class)->validate('invalid_block');

    expect($errors)->toContain(
        'Block type [invalid_block] allowed_children references unknown block type [not_a_real_block].',
    );
});

it('validates nested snapshot children against parent allowlist', function (): void {
    $errors = resolve(BlockValidationService::class)->validateSnapshotBlock([
        'type' => 'two_columns',
        'children' => [
            ['type' => 'hero_banner'],
        ],
    ], 'snapshot.sections.0.blocks.0');

    expect($errors)->toHaveKey('snapshot.sections.0.blocks.0.children.0.type')
        ->and($errors['snapshot.sections.0.blocks.0.children.0.type'][0])
        ->toContain('not allowed as a child of [two_columns]');
});

it('throws validation exception from validateOrThrow', function (): void {
    resolve(BlockValidationService::class)->validateOrThrow('missing_block', 'type');
})->throws(ValidationException::class);
