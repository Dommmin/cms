<?php

declare(strict_types=1);

namespace App\Services\PageBuilder;

use Illuminate\Support\Facades\File;
use JsonException;

final class BlockSchemaExportService
{
    public const string OUTPUT_RELATIVE_PATH = 'blocks.schema.json';

    /**
     * @return array<string, array{
     *     type: string,
     *     schema: array<string, mixed>,
     *     data_strategy: string,
     *     context_dependencies: list<string>,
     *     allowed_children: list<string>|null
     * }>
     */
    public function export(): array
    {
        /** @var array<string, array<string, mixed>> $blockTypes */
        $blockTypes = config('blocks.block_types', []);
        $types = array_keys($blockTypes);
        sort($types);

        $export = [];

        foreach ($types as $type) {
            $export[$type] = [
                'type' => $type,
                'schema' => BlockDefinition::getSchema($type),
                'data_strategy' => BlockDefinition::getDataStrategy($type)->value,
                'context_dependencies' => BlockDefinition::getContextDependencies($type),
                'allowed_children' => BlockDefinition::getAllowedChildren($type),
            ];
        }

        return $export;
    }

    /**
     * @throws JsonException
     */
    public function toJson(): string
    {
        $json = json_encode(
            $this->export(),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR,
        );

        return $json."\n";
    }

    public function outputPath(): string
    {
        return storage_path('app/'.self::OUTPUT_RELATIVE_PATH);
    }

    /**
     * @throws JsonException
     */
    public function writeToStorage(): void
    {
        File::put($this->outputPath(), $this->toJson());
    }
}
