<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Promotion extends Model
{
    use HasFactory;

    protected $table = 'promotions';

    protected $fillable = [
        'name', 'slug', 'description', 'type', 'value', 'min_value', 'max_discount',
        'apply_to', 'is_active', 'is_stackable', 'priority', 'starts_at', 'ends_at', 'metadata',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_stackable' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'promotion_products')
            ->withPivot('discount_value', 'discount_type')
            ->withTimestamps();
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'promotion_categories')
            ->withPivot('discount_value', 'discount_type')
            ->withTimestamps();
    }

    public function getApplicableProducts()
    {
        if ($this->apply_to === 'all') {
            return Product::query();
        }

        if ($this->apply_to === 'specific_products') {
            return $this->products();
        }

        if ($this->apply_to === 'specific_categories') {
            return Product::query()->whereHas('categories', function ($query): void {
                $query->whereIn('categories.id', $this->categories()->pluck('categories.id'));
            });
        }

        return Product::query()->whereRaw('1 = 0');
    }

    public function calculateDiscount($product, $quantity = 1, $originalPrice = null)
    {
        $price = $originalPrice ?? $product->price;
        $discountValue = 0;

        switch ($this->type) {
            case 'percentage':
                $discountValue = $price * ($this->value / 100) * $quantity;
                break;

            case 'fixed_amount':
                $discountValue = min($this->value, $price * $quantity);
                break;

            case 'buy_x_get_y':
                $buyQty = $this->metadata['buy_quantity'] ?? 1;
                $getQty = $this->metadata['get_quantity'] ?? 1;
                $discountPercent = $this->metadata['discount_percentage'] ?? 100;

                $eligibleSets = intdiv($quantity, $buyQty);
                $freeItems = min($eligibleSets * $getQty, $quantity);
                $discountValue = ($price * $discountPercent / 100) * $freeItems;
                break;

            case 'free_shipping':
                $discountValue = $product->shipping_cost ?? 0;
                break;
        }

        if ($this->max_discount && $discountValue > $this->max_discount) {
            $discountValue = $this->max_discount;
        }

        if ($this->min_value && $price * $quantity < $this->min_value) {
            return 0;
        }

        return $discountValue;
    }

    #[Scope]
    protected function active($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q): void {
                $q->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q): void {
                $q->whereNull('ends_at')
                    ->orWhere('ends_at', '>=', now());
            });
    }

    #[Scope]
    protected function ordered($query)
    {
        return $query->orderBy('priority')->orderBy('name');
    }
}
