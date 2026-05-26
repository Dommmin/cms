<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\EngineManager;
use Throwable;

#[Description('Import all enabled search indexes to Typesense')]
#[Signature('scout:import-search
        {--chunk=500 : The number of records to import at once}
        {--fresh : Delete collections before importing}
        {--only= : Comma-separated list of indexes to import (products,categories,blog_posts)}')]
class ImportSearchIndex extends Command
{
    /** @var array<string, class-string<Model>> */
    protected array $indexes = [
        'products' => Product::class,
        'categories' => Category::class,
        'blog_posts' => BlogPost::class,
    ];

    public function handle(EngineManager $engineManager): int
    {
        $chunk = (int) $this->option('chunk');
        $fresh = (bool) $this->option('fresh');
        $only = $this->option('only')
            ? explode(',', (string) $this->option('only'))
            : array_keys($this->indexes);

        $settingsToggles = [
            'products' => 'index_products',
            'categories' => 'index_categories',
            'blog_posts' => 'index_blog_posts',
        ];

        foreach ($only as $indexName) {
            if (! isset($this->indexes[$indexName])) {
                $this->warn(sprintf('Unknown index: %s. Skipping.', $indexName));

                continue;
            }

            $toggleKey = $settingsToggles[$indexName];
            if (! (bool) Setting::get('search', $toggleKey, true)) {
                $this->info(sprintf('[%s] Disabled in settings — skipping. Enable it in Admin → Settings → Search.', $indexName));

                continue;
            }

            $modelClass = $this->indexes[$indexName];
            $this->importIndex($indexName, $modelClass, $chunk, $fresh, $engineManager);
        }

        $this->info('All done!');

        return self::SUCCESS;
    }

    /**
     * @param  class-string<Model>  $modelClass
     */
    private function importIndex(string $indexName, string $modelClass, int $chunk, bool $fresh, EngineManager $engineManager): void
    {
        $collectionName = (new $modelClass)->searchableAs();

        if ($fresh) {
            $this->info(sprintf('[%s] Dropping existing collection…', $indexName));
            try {
                $engine = $engineManager->engine('typesense');
                $engine->deleteIndex($collectionName);
                $this->info(sprintf('[%s] Collection deleted.', $indexName));
            } catch (Throwable) {
                $this->warn(sprintf('[%s] Collection did not exist, continuing.', $indexName));
            }
        }

        $this->info(sprintf('[%s] Importing…', $indexName));

        $total = $modelClass::query()->count();
        $this->output->progressStart($total);

        $imported = 0;
        $removed = 0;

        $modelClass::query()
            ->with($this->getEagerRelations($modelClass))
            ->chunkById($chunk, function ($models) use (&$imported, &$removed): void {
                foreach ($models as $model) {
                    if ($model->shouldBeSearchable()) {
                        $model->searchable();
                        $imported++;
                    } else {
                        $model->unsearchable();
                        $removed++;
                    }
                }

                $this->output->progressAdvance($models->count());
            });

        $this->output->progressFinish();
        $this->info(sprintf('[%s] Done! Imported: %d, Removed: %d', $indexName, $imported, $removed));
    }

    /**
     * @param  class-string<Model>  $modelClass
     * @return string[]
     */
    private function getEagerRelations(string $modelClass): array
    {
        return match ($modelClass) {
            Product::class => ['category', 'brand', 'variants', 'media'],
            Category::class => ['products'],
            BlogPost::class => ['author'],
            default => [],
        };
    }
}
