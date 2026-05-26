<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Laravel\Scout\EngineManager;
use Throwable;

class ImportProductsToSearch extends Command
{
    protected $signature = 'scout:import-products {--chunk=500 : The number of records to import at once}
                                                    {--fresh : Delete the collection before importing}';

    protected $description = 'Import all products to Typesense search index';

    public function handle(EngineManager $engineManager): int
    {
        $chunk = (int) $this->option('chunk');
        $fresh = (bool) $this->option('fresh');

        if ($fresh) {
            $this->info('Dropping existing collection…');
            try {
                $engine = $engineManager->engine('typesense');
                $engine->deleteIndex('products');
                $this->info('Collection deleted.');
            } catch (Throwable) {
                $this->warn('Collection did not exist, continuing.');
            }
        }

        $this->info('Importing products to search index…');

        $total = Product::query()->count();
        $this->output->progressStart($total);

        $imported = 0;
        $removed = 0;

        Product::query()
            ->with(['category', 'brand', 'variants', 'media'])
            ->chunkById($chunk, function ($products) use (&$imported, &$removed): void {
                foreach ($products as $product) {
                    if ($product->is_active) {
                        $product->searchable();
                        $imported++;
                    } else {
                        $product->unsearchable();
                        $removed++;
                    }
                }

                $this->output->progressAdvance($products->count());
            });

        $this->output->progressFinish();

        $this->info(sprintf('Done! Imported: %d, Removed: %d', $imported, $removed));

        return self::SUCCESS;
    }
}
