<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Date;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

class GenerateSitemap extends Command
{
    protected $signature = 'sitemap:generate';

    protected $description = 'Generate sitemap.xml (products, categories, pages)';

    public function handle(): int
    {
        $baseUrl = mb_rtrim(config('app.frontend_url'), '/');

        $sitemap = Sitemap::create();

        $sitemap->add(Url::create($baseUrl.'/')
            ->setLastModificationDate(Date::now())
            ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
            ->setPriority(1.0));

        Product::query()
            ->where('is_active', true)
            ->where('is_saleable', true)
            ->get(['slug', 'updated_at'])
            ->each(function (Product $product) use ($sitemap, $baseUrl): void {
                $sitemap->add(
                    Url::create($baseUrl.'/products/'.$product->slug)
                        ->setLastModificationDate(Date::parse($product->updated_at))
                        ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                        ->setPriority(0.8)
                );
            });

        Category::query()
            ->where('is_active', true)
            ->get(['slug', 'updated_at'])
            ->each(function (Category $category) use ($sitemap, $baseUrl): void {
                $sitemap->add(
                    Url::create($baseUrl.'/categories/'.$category->slug)
                        ->setLastModificationDate(Date::parse($category->updated_at))
                        ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                        ->setPriority(0.7)
                );
            });

        Page::query()
            ->where('is_published', true)
            ->get(['slug', 'updated_at'])
            ->each(function (Page $page) use ($sitemap, $baseUrl): void {
                $sitemap->add(
                    Url::create($baseUrl.'/'.$page->slug)
                        ->setLastModificationDate(Date::parse($page->updated_at))
                        ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                        ->setPriority(0.6)
                );
            });

        $path = public_path('sitemap.xml');
        $sitemap->writeToFile($path);

        $this->info('Sitemap written to '.$path);

        return self::SUCCESS;
    }
}
