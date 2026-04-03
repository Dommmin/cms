<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BulkProductUpdate extends Command
{
    protected $signature = 'products:bulk-update
        {--action=status : Action to perform (status, price, stock)}
        {--value= : New value to set}
        {--ids=* : Product IDs to update (optional)}';

    protected $description = 'Bulk update products (status, price, stock)';

    public function handle(): int
    {
        $action = $this->option('action');
        $value = $this->option('value');
        $ids = $this->option('ids');

        if (empty($value)) {
            $this->error('Value is required');

            return self::FAILURE;
        }

        $query = Product::query();

        if (! empty($ids)) {
            $query->whereIn('id', $ids);
        }

        $count = 0;

        DB::transaction(function () use ($query, $action, $value, &$count): void {
            $count = match ($action) {
                'status' => $query->update(['is_active' => $value === 'active']),
                'price' => $this->updatePrices($query, (int) $value),
                'stock' => $query->update(['stock' => (int) $value]),
                default => 0,
            };
        });

        $this->info(sprintf('Updated %d products.', $count));

        return self::SUCCESS;
    }

    private function updatePrices($query, int $newPrice): int
    {
        return DB::table('product_variants')
            ->whereIn('product_id', $query->pluck('id'))
            ->update(['price' => $newPrice]);
    }
}
