<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\PageBuilder\BlockSchemaExportService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use JsonException;

#[Description('Export block type schemas to storage/app/blocks.schema.json')]
#[Signature('blocks:export {--check : Fail when export differs from committed snapshot}')]
class ExportBlocksSchema extends Command
{
    public function handle(BlockSchemaExportService $exporter): int
    {
        try {
            if ($this->option('check')) {
                return $this->checkSnapshot($exporter);
            }

            $exporter->writeToStorage();
        } catch (JsonException $jsonException) {
            $this->error('Failed to encode block schemas: '.$jsonException->getMessage());

            return self::FAILURE;
        }

        $this->info('Block schemas exported to storage/app/'.BlockSchemaExportService::OUTPUT_RELATIVE_PATH);

        return self::SUCCESS;
    }

    private function checkSnapshot(BlockSchemaExportService $exporter): int
    {
        $snapshotPath = $exporter->snapshotPath();

        if (! File::exists($snapshotPath)) {
            $this->error('Snapshot file is missing at '.BlockSchemaExportService::SNAPSHOT_RELATIVE_PATH);
            $this->line('Run: php artisan blocks:export and copy storage/app/'.BlockSchemaExportService::OUTPUT_RELATIVE_PATH.' to '.BlockSchemaExportService::SNAPSHOT_RELATIVE_PATH);

            return self::FAILURE;
        }

        if (! $exporter->matchesSnapshot()) {
            $this->error('blocks.schema.json snapshot is out of date.');
            $this->line('Run: php artisan blocks:export and copy storage/app/'.BlockSchemaExportService::OUTPUT_RELATIVE_PATH.' to '.BlockSchemaExportService::SNAPSHOT_RELATIVE_PATH);

            return self::FAILURE;
        }

        $this->info('blocks.schema.json snapshot is up to date.');

        return self::SUCCESS;
    }
}
