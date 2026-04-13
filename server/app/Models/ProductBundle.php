<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProductBundle extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'name',
        'description',
        'discount_percentage',
        'is_active',
    ];

    protected $casts = [
        'discount_percentage' => 'integer',
        'is_active' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function items(): BelongsToMany
    {
        return $this->belongsToMany(ProductVariant::class, 'product_bundle_items')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    public function calculateBundlePrice(): int
    {
        $total = $this->items->sum(fn ($variant): int|float => $variant->price * $variant->pivot->quantity);

        if ($this->discount_percentage > 0) {
            return (int) ($total * (100 - $this->discount_percentage) / 100);
        }

        return $total;
    }
}
