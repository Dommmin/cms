<?php

declare(strict_types=1);

namespace App\Services\PageBuilder;

use App\Enums\BlockDataStrategy;
use InvalidArgumentException;

final class BlockDefinition
{
    /**
     * @return array<string, mixed>
     */
    public static function getSchema(string $type): array
    {
        $definition = self::definition($type);

        /** @var array<string, mixed> $schema */
        $schema = $definition['schema'];

        return $schema;
    }

    public static function getDataStrategy(string $type): BlockDataStrategy
    {
        $definition = self::definition($type);

        return self::parseDataStrategy($type, $definition['data_strategy']);
    }

    /**
     * @return list<string>
     */
    public static function getContextDependencies(string $type): array
    {
        $definition = self::definition($type);
        $dependencies = $definition['context_dependencies'] ?? [];

        if (! is_array($dependencies)) {
            throw new InvalidArgumentException(sprintf(
                'Block type [%s] field [context_dependencies] must be an array.',
                $type,
            ));
        }

        /** @var list<string> */
        return array_values(array_map(strval(...), $dependencies));
    }

    /**
     * @return list<string>|null
     */
    public static function getAllowedChildren(string $type): ?array
    {
        $definition = self::definition($type);
        $allowedChildren = $definition['allowed_children'] ?? null;

        if ($allowedChildren === null) {
            return null;
        }

        if (! is_array($allowedChildren)) {
            throw new InvalidArgumentException(sprintf(
                'Block type [%s] field [allowed_children] must be an array or null.',
                $type,
            ));
        }

        /** @var list<string> */
        return array_values(array_map(strval(...), $allowedChildren));
    }

    /**
     * @return array<string, mixed>
     */
    private static function definition(string $type): array
    {
        $definition = config('blocks.block_types.'.$type);

        if (! is_array($definition)) {
            throw new InvalidArgumentException(sprintf('Unknown block type [%s].', $type));
        }

        self::assertRequiredFields($type, $definition);

        return $definition;
    }

    /**
     * @param  array<string, mixed>  $definition
     */
    private static function assertRequiredFields(string $type, array $definition): void
    {
        if (! array_key_exists('schema', $definition) || ! is_array($definition['schema'])) {
            throw new InvalidArgumentException(sprintf(
                'Block type [%s] is missing required field [schema].',
                $type,
            ));
        }

        if (
            ! array_key_exists('data_strategy', $definition)
            || $definition['data_strategy'] === null
            || $definition['data_strategy'] === ''
        ) {
            throw new InvalidArgumentException(sprintf(
                'Block type [%s] is missing required field [data_strategy].',
                $type,
            ));
        }
    }

    private static function parseDataStrategy(string $type, mixed $value): BlockDataStrategy
    {
        if ($value instanceof BlockDataStrategy) {
            return $value;
        }

        $strategy = BlockDataStrategy::tryFrom((string) $value);

        if ($strategy === null) {
            throw new InvalidArgumentException(sprintf(
                'Block type [%s] has invalid data_strategy [%s].',
                $type,
                (string) $value,
            ));
        }

        return $strategy;
    }
}
