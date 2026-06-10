<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Database\Factories\FlashSaleFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Date;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property string $name
 * @property int $product_id
 * @property int|null $variant_id
 * @property int $sale_price
 * @property Carbon|null $starts_at
 * @property Carbon|null $ends_at
 * @property bool $is_active
 * @property int|null $stock_limit
 * @property int $stock_sold
 * @property Product|null $product
 * @property ProductVariant|null $variant
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Activity> $activities
 * @property-read int|null $activities_count
 * @property-read string $status
 *
 * @method static Builder<static>|FlashSale active()
 * @method static FlashSaleFactory factory($count = null, $state = [])
 * @method static Builder<static>|FlashSale newModelQuery()
 * @method static Builder<static>|FlashSale newQuery()
 * @method static Builder<static>|FlashSale query()
 * @method static Builder<static>|FlashSale whereCreatedAt($value)
 * @method static Builder<static>|FlashSale whereEndsAt($value)
 * @method static Builder<static>|FlashSale whereId($value)
 * @method static Builder<static>|FlashSale whereIsActive($value)
 * @method static Builder<static>|FlashSale whereName($value)
 * @method static Builder<static>|FlashSale whereProductId($value)
 * @method static Builder<static>|FlashSale whereSalePrice($value)
 * @method static Builder<static>|FlashSale whereStartsAt($value)
 * @method static Builder<static>|FlashSale whereStockLimit($value)
 * @method static Builder<static>|FlashSale whereStockSold($value)
 * @method static Builder<static>|FlashSale whereUpdatedAt($value)
 * @method static Builder<static>|FlashSale whereVariantId($value)
 *
 * @mixin Model
 */
#[Guarded(['id'])]
#[Table(name: 'flash_sales')]
class FlashSale extends Model
{
    use HasFactory;
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'sale_price', 'starts_at', 'ends_at', 'is_active'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('flash_sale');
    }

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

    protected function status(): Attribute
    {
        return Attribute::make(get: function (): string {
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
        });
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
