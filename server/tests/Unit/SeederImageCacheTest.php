<?php

declare(strict_types=1);

use Database\Seeders\Concerns\CachesImages;
use Tests\TestCase;

uses(TestCase::class);

it('uses local svg placeholders for seed images by default', function (): void {
    config(['media-library.download_seed_images' => false]);

    $cache = new class
    {
        use CachesImages;

        public function imagePath(string $seed): string
        {
            return $this->seederImage($seed);
        }
    };

    $path = $cache->imagePath('unit-test-fast-seed-placeholder');

    expect($path)->toEndWith('.svg')
        ->and(file_get_contents($path))->toContain('<svg');
});
