<?php

declare(strict_types=1);

namespace Database\Seeders\Concerns;

use App\Models\CmsMedia;
use App\Models\Product;
use Illuminate\Support\Facades\Config;

trait CachesImages
{
    private function seederImage(string $seed, int $width = 800, int $height = 800): string
    {
        $dir = storage_path('app/seeds/images');
        $extension = config('media-library.download_seed_images', false) ? 'jpg' : 'svg';
        $file = sprintf('%s/%s-%dx%d.%s', $dir, $seed, $width, $height, $extension);

        if (! file_exists($file)) {
            if (! is_dir($dir)) {
                mkdir($dir, 0755, true);
            }

            $contents = config('media-library.download_seed_images', false)
                ? file_get_contents(sprintf('https://picsum.photos/seed/%s/%d/%d', $seed, $width, $height))
                : $this->placeholderSvg($seed, $width, $height);

            if ($contents !== false) {
                file_put_contents($file, $contents);
            }
        }

        return $file;
    }

    private function addProductImages(Product $product, string $seedPrefix, int $count = 4): void
    {
        $imageCount = min($count, max(0, (int) config('media-library.seed_images_per_product', 1)));
        $originalSkipSeedConversions = (bool) config('media-library.skip_seed_conversions', false);

        Config::set(
            'media-library.skip_seed_conversions',
            ! (bool) config('media-library.generate_seed_conversions', false),
        );

        try {
            for ($i = 0; $i < $imageCount; $i++) {
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
        } finally {
            Config::set('media-library.skip_seed_conversions', $originalSkipSeedConversions);
        }
    }

    private function placeholderSvg(string $seed, int $width, int $height): string
    {
        $hash = mb_substr(sha1($seed), 0, 12);
        $primary = '#'.mb_substr($hash, 0, 6);
        $secondary = '#'.mb_substr($hash, 6, 6);
        $label = htmlspecialchars(str_replace('-', ' ', $seed), ENT_XML1 | ENT_QUOTES, 'UTF-8');
        $innerWidth = $width - 96;
        $innerHeight = $height - 96;

        return <<<SVG
            <svg xmlns="http://www.w3.org/2000/svg" width="{$width}" height="{$height}" viewBox="0 0 {$width} {$height}" role="img" aria-label="{$label}">
                <defs>
                    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stop-color="{$primary}"/>
                        <stop offset="1" stop-color="{$secondary}"/>
                    </linearGradient>
                </defs>
                <rect width="{$width}" height="{$height}" fill="url(#bg)"/>
                <rect x="48" y="48" width="{$innerWidth}" height="{$innerHeight}" rx="32" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.28)" stroke-width="2"/>
                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="34" font-weight="700">{$label}</text>
            </svg>
        SVG;
    }
}
