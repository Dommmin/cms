<?php

declare(strict_types=1);

namespace Database\Seeders\Concerns;

use App\Models\CmsMedia;
use App\Models\Product;

trait CachesImages
{
    private function seederImage(string $seed, int $width = 800, int $height = 800): string
    {
        $dir = storage_path('app/seeds/images');
        $file = sprintf('%s/%s-%dx%d.jpg', $dir, $seed, $width, $height);

        if (! file_exists($file)) {
            if (! is_dir($dir)) {
                mkdir($dir, 0755, true);
            }

            $contents = file_get_contents(sprintf('https://picsum.photos/seed/%s/%d/%d', $seed, $width, $height));

            if ($contents !== false) {
                file_put_contents($file, $contents);
            }
        }

        return $file;
    }

    private function addProductImages(Product $product, string $seedPrefix, int $count = 4): void
    {
        for ($i = 0; $i < $count; $i++) {
            $file = $this->seederImage(sprintf('%s-%d', $seedPrefix, $i));

            if (! file_exists($file)) {
                continue;
            }

            $cmsMedia = CmsMedia::query()->create([]);
            $media = $cmsMedia->addMedia($file)
                ->preservingOriginal()
                ->toMediaCollection('default');

            $product->images()->create([
                'media_id' => (int) $media->getKey(),
                'is_thumbnail' => $i === 0,
                'position' => $i,
            ]);
        }
    }
}
