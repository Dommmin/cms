<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Date;

class FlashSale extends Model
{
    use HasFactory;

    protected $table = 'flash_sales';

    protected $guarded = ['id'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    public function isAvailable(): bool
    {
        $now = Date::now();

        if (! $this->is_active) {
            return false;
        }

        if ($this->starts_at > $now || $this->ends_at < $now) {
            return false;
        }

        if ($this->stock_limit !== null && $this->stock_sold >= $this->stock_limit) {
            return false;
        }

        return true;
    }

    public function stockRemaining(): ?int
    {
        if ($this->stock_limit === null) {
            return null;
        }

        return max(0, $this->stock_limit - $this->stock_sold);
    }

    /**
     * Scope: currently active flash sales (time window + stock not exhausted).
     */
    protected function scopeActive(Builder $query): Builder
    {
        $now = Date::now();

        return $query
            ->where('is_active', true)
            ->where('starts_at', '<=', $now)
            ->where('ends_at', '>=', $now)
            ->where(function (Builder $q): void {
                $q->whereNull('stock_limit')
                    ->orWhereColumn('stock_sold', '<', 'stock_limit');
            });
    }

    protected function getStatusAttribute(): string
    {
        $now = Date::now();

        if (! $this->is_active) {
            return 'inactive';
        }

        if ($this->starts_at > $now) {
            return 'scheduled';
        }

        if ($this->ends_at < $now) {
            return 'ended';
        }

        if ($this->stock_limit !== null && $this->stock_sold >= $this->stock_limit) {
            return 'exhausted';
        }

        return 'active';
    }

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_active' => 'boolean',
            'sale_price' => 'integer',
            'stock_limit' => 'integer',
            'stock_sold' => 'integer',
        ];
    }
}
