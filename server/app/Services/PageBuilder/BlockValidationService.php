<?php

declare(strict_types=1);

namespace App\Services\PageBuilder;

use App\Enums\BlockDataStrategy;
use App\Enums\PageBlockTypeEnum;
use Illuminate\Validation\ValidationException;

final class BlockValidationService
{
    /**
     * @return list<string>
     */
    public function validate(string $blockType): array
    {
        $errors = [];

        $registry = config('blocks.block_types');
        if (! is_array($registry)) {
            $errors[] = 'Block registry is not configured.';

            return $errors;
        }

        if (! array_key_exists($blockType, $registry)) {
            $errors[] = sprintf('Block type [%s] is not registered.', $blockType);

            return $errors;
        }

        if (PageBlockTypeEnum::tryFrom($blockType) === null) {
            $errors[] = sprintf('Block type [%s] is missing from PageBlockTypeEnum.', $blockType);
        }

        /** @var array<string, mixed> $definition */
        $definition = $registry[$blockType];

        $errors = array_merge($errors, $this->validateSchemaField($blockType, $definition));
        $errors = array_merge($errors, $this->validateDataStrategyField($blockType, $definition));
        $errors = array_merge($errors, $this->validateContextDependenciesField($blockType, $definition));

        return array_merge($errors, $this->validateAllowedChildrenField($blockType, $definition, array_keys($registry)));
    }

    /**
     * @throws ValidationException
     */
    public function validateOrThrow(string $blockType, string $attribute = 'type'): void
    {
        $errors = $this->validate($blockType);

        if ($errors === []) {
            return;
        }

        throw ValidationException::withMessages([
            $attribute => $errors,
        ]);
    }

    /**
     * @param  array<string, mixed>  $block
     * @return array<string, list<string>>
     */
    public function validateSnapshotBlock(array $block, string $attribute): array
    {
        $errors = [];
        $blockType = $block['type'] ?? null;

        if (! is_string($blockType) || $blockType === '') {
            return $errors;
        }

        foreach ($this->validate($blockType) as $message) {
            $errors[$attribute.'.type'][] = $message;
        }

        $children = $block['children'] ?? null;
        if ($children === null) {
            return $errors;
        }

        if (! is_array($children)) {
            $errors[$attribute.'.children'][] = 'The '.$attribute.'.children field must be an array.';

            return $errors;
        }

        $allowedChildren = BlockDefinition::getAllowedChildren($blockType);
        if ($allowedChildren === null) {
            $errors[$attribute.'.children'][] = sprintf(
                'Block type [%s] does not accept nested child blocks.',
                $blockType,
            );

            return $errors;
        }

        $allowedChildrenSet = array_fill_keys($allowedChildren, true);

        foreach ($children as $childIndex => $child) {
            $childAttribute = $attribute.'.children.'.$childIndex;

            if (! is_array($child)) {
                $errors[$childAttribute][] = 'The '.$childAttribute.' field must be an object.';

                continue;
            }

            $childType = $child['type'] ?? null;
            if (! is_string($childType) || $childType === '') {
                $errors[$childAttribute.'.type'][] = 'The '.$childAttribute.'.type field is required.';

                continue;
            }

            if (! isset($allowedChildrenSet[$childType])) {
                $errors[$childAttribute.'.type'][] = sprintf(
                    'Block type [%s] is not allowed as a child of [%s].',
                    $childType,
                    $blockType,
                );
            }

            $errors = array_merge(
                $errors,
                $this->validateSnapshotBlock($child, $childAttribute),
            );
        }

        return $errors;
    }

    /**
     * @param  array<string, mixed>  $definition
     * @return list<string>
     */
    private function validateSchemaField(string $blockType, array $definition): array
    {
        if (! array_key_exists('schema', $definition) || ! is_array($definition['schema'])) {
            return [sprintf('Block type [%s] is missing required field [schema].', $blockType)];
        }

        if ($definition['schema'] === []) {
            return [sprintf('Block type [%s] schema must not be empty.', $blockType)];
        }

        return [];
    }

    /**
     * @param  array<string, mixed>  $definition
     * @return list<string>
     */
    private function validateDataStrategyField(string $blockType, array $definition): array
    {
        if (
            ! array_key_exists('data_strategy', $definition)
            || $definition['data_strategy'] === null
            || $definition['data_strategy'] === ''
        ) {
            return [sprintf('Block type [%s] is missing required field [data_strategy].', $blockType)];
        }

        $strategy = $definition['data_strategy'];
        if ($strategy instanceof BlockDataStrategy) {
            return [];
        }

        if (BlockDataStrategy::tryFrom((string) $strategy) !== null) {
            return [];
        }

        return [sprintf(
            'Block type [%s] has invalid data_strategy [%s].',
            $blockType,
            (string) $strategy,
        )];
    }

    /**
     * @param  array<string, mixed>  $definition
     * @return list<string>
     */
    private function validateContextDependenciesField(string $blockType, array $definition): array
    {
        $dependencies = $definition['context_dependencies'] ?? [];

        if (! is_array($dependencies)) {
            return [sprintf(
                'Block type [%s] field [context_dependencies] must be an array.',
                $blockType,
            )];
        }

        $allowedKeys = config('blocks.context_dependency_keys', []);
        if (! is_array($allowedKeys)) {
            return ['Block context dependency keys are not configured.'];
        }

        $allowedKeys = array_fill_keys(array_map(strval(...), $allowedKeys), true);
        $errors = [];
        $seen = [];

        foreach ($dependencies as $index => $dependency) {
            if (! is_string($dependency) || $dependency === '') {
                $errors[] = sprintf(
                    'Block type [%s] context_dependencies[%s] must be a non-empty string.',
                    $blockType,
                    (string) $index,
                );

                continue;
            }

            if (! isset($allowedKeys[$dependency])) {
                $errors[] = sprintf(
                    'Block type [%s] has invalid context dependency [%s].',
                    $blockType,
                    $dependency,
                );
            }

            if (isset($seen[$dependency])) {
                $errors[] = sprintf(
                    'Block type [%s] context_dependencies contains duplicate [%s].',
                    $blockType,
                    $dependency,
                );
            }

            $seen[$dependency] = true;
        }

        return $errors;
    }

    /**
     * @param  array<string, mixed>  $definition
     * @param  list<string>  $registeredTypes
     * @return list<string>
     */
    private function validateAllowedChildrenField(
        string $blockType,
        array $definition,
        array $registeredTypes,
    ): array {
        if (! array_key_exists('allowed_children', $definition)) {
            return [];
        }

        $allowedChildren = $definition['allowed_children'];

        if ($allowedChildren === null) {
            return [];
        }

        if (! is_array($allowedChildren)) {
            return [sprintf(
                'Block type [%s] field [allowed_children] must be an array or null.',
                $blockType,
            )];
        }

        if ($allowedChildren === []) {
            return [sprintf(
                'Block type [%s] field [allowed_children] must not be empty when defined.',
                $blockType,
            )];
        }

        $registeredTypesSet = array_fill_keys($registeredTypes, true);
        $errors = [];
        $seen = [];

        foreach ($allowedChildren as $index => $childType) {
            if (! is_string($childType) || $childType === '') {
                $errors[] = sprintf(
                    'Block type [%s] allowed_children[%s] must be a non-empty string.',
                    $blockType,
                    (string) $index,
                );

                continue;
            }

            if (! isset($registeredTypesSet[$childType])) {
                $errors[] = sprintf(
                    'Block type [%s] allowed_children references unknown block type [%s].',
                    $blockType,
                    $childType,
                );
            }

            if (isset($seen[$childType])) {
                $errors[] = sprintf(
                    'Block type [%s] allowed_children contains duplicate [%s].',
                    $blockType,
                    $childType,
                );
            }

            $seen[$childType] = true;
        }

        return $errors;
    }
}
