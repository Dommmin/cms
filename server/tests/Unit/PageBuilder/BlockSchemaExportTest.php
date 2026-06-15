<?php

declare(strict_types=1);

use App\Services\PageBuilder\BlockSchemaExportService;
use Illuminate\Support\Facades\File;

it('exports block schemas matching the committed snapshot', function (): void {
    $snapshotPath = __DIR__.'/snapshots/blocks.schema.json';

    expect(file_exists($snapshotPath))->toBeTrue(
        'Snapshot file is missing. Run: php artisan blocks:export and copy storage/app/blocks.schema.json to tests/Unit/PageBuilder/snapshots/blocks.schema.json',
    );

    $json = app(BlockSchemaExportService::class)->toJson();

    expect($json)->toBe(file_get_contents($snapshotPath));
});

it('writes block schemas to storage via artisan command', function (): void {
    $outputPath = storage_path('app/blocks.schema.json');

    if (File::exists($outputPath)) {
        File::delete($outputPath);
    }

    $this->artisan('blocks:export')->assertSuccessful();

    expect(File::exists($outputPath))->toBeTrue();

    $snapshotPath = __DIR__.'/snapshots/blocks.schema.json';
    $exported = File::get($outputPath);

    expect($exported)->toBe(file_get_contents($snapshotPath));

    File::delete($outputPath);
});
