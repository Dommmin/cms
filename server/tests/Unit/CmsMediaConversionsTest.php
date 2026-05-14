<?php

declare(strict_types=1);

use App\Models\CmsMedia;
use Tests\TestCase;

uses(TestCase::class);

it('can skip media conversions while product seeders attach images', function (): void {
    config(['media-library.skip_seed_conversions' => true]);

    $media = new CmsMedia();
    $media->registerMediaConversions();

    expect($media->mediaConversions)->toBeEmpty();
});

it('registers default cms media conversions outside seed image imports', function (): void {
    config(['media-library.skip_seed_conversions' => false]);

    $media = new CmsMedia();
    $media->registerMediaConversions();

    expect(collect($media->mediaConversions)->map->getName()->all())
        ->toBe(['thumbnail', 'optimized']);
});
