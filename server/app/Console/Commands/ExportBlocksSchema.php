<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\PageBuilder\BlockSchemaExportService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use JsonException;

#[Description('Export block type schemas to storage/app/blocks.schema.json')]
#[Signature('blocks:export')]
class ExportBlocksSchema extends Command
{
    public function handle(BlockSchemaExportService $exporter): int
    {
        try {
            $exporter->writeToStorage();
        } catch (JsonException $exception) {
            $this->error('Failed to encode block schemas: '.$exception->getMessage());

            return self::FAILURE;
        }

        $this->info('Block schemas exported to storage/app/'.BlockSchemaExportService::OUTPUT_RELATIVE_PATH);

        return self::SUCCESS;
    }
}
