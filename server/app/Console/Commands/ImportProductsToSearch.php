<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;

class ImportProductsToSearch extends Command
{
    protected $signature = 'scout:import-products {--chunk=500 : The number of records to import at once}';

    protected $description = 'Import all products to Typesense search index';

    public function handle(): int
    {
        $this->info('Importing products to search index...');

        $chunk = (int) $this->option('chunk');

        $this->output->progressStart(
            Product::query()->count()
        );

        Product::query()
            ->with(['category', 'brand', 'variants', 'media'])
            ->chunkById($chunk, function ($products): void {
                foreach ($products as $product) {
                    if ($product->is_active) {
                        $product->searchable();
                    } else {
                        $product->unsearchable();
                    }
                }

                $this->output->progressAdvance($products->count());
            });

        $this->output->progressFinish();

        $this->info('Products imported successfully!');

        return self::SUCCESS;
    }
}
