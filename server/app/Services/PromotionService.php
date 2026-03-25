<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Discount;
use App\Models\Product;
use App\Models\Promotion;
use Illuminate\Support\Collection;

class PromotionService
{
    /**
     * Calculate all applicable discounts and promotions for cart items
     */
    public function calculateCartDiscounts(array $cartItems): array
    {
        $results = [
            'items' => [],
            'total_discount' => 0,
            'applied_promotions' => [],
            'applied_discounts' => [],
        ];

        foreach ($cartItems as $cartItem) {
            $product = Product::query()->find($cartItem['product_id']);
            if (! $product) {
                continue;
            }

            $quantity = $cartItem['quantity'];
            $originalPrice = $cartItem['price'] ?? $product->price;

            $itemResult = $this->calculateItemDiscounts($product, $quantity, $originalPrice);

            $results['items'][] = $itemResult;
            $results['total_discount'] += $itemResult['total_discount'];
            $results['applied_promotions'] = array_merge(
                $results['applied_promotions'],
                $itemResult['promotions']
            );
        }

        // Remove duplicates and sort by priority
        $results['applied_promotions'] = collect($results['applied_promotions'])
            ->unique('id')
            ->sortBy('priority')
            ->values()
            ->toArray();

        return $results;
    }

    /**
     * Calculate discounts for a single item
     */
    public function calculateItemDiscounts(Product $product, int $quantity, float $originalPrice): array
    {
        $result = [
            'product_id' => $product->id,
            'original_price' => $originalPrice,
            'quantity' => $quantity,
            'original_total' => $originalPrice * $quantity,
            'promotions' => [],
            'discounts' => [],
            'total_discount' => 0,
            'final_price' => $originalPrice,
            'final_total' => $originalPrice * $quantity,
        ];

        // Get applicable promotions (ordered by priority)
        $promotions = $this->getApplicablePromotions($product);

        $currentPrice = $originalPrice;
        $totalDiscount = 0;
        $appliedPromotions = [];

        foreach ($promotions as $promotion) {
            $discountAmount = $promotion->calculateDiscount($product, $quantity, $currentPrice);

            if ($discountAmount > 0) {
                $appliedPromotions[] = [
                    'id' => $promotion->id,
                    'name' => $promotion->name,
                    'type' => $promotion->type,
                    'discount_amount' => $discountAmount,
                    'priority' => $promotion->priority,
                ];

                $totalDiscount += $discountAmount;

                // If not stackable, break after first applicable promotion
                if (! $promotion->is_stackable) {
                    break;
                }
            }
        }

        $result['promotions'] = $appliedPromotions;
        $result['total_discount'] = $totalDiscount;
        $result['final_total'] = $result['original_total'] - $totalDiscount;

        if ($quantity > 0) {
            $result['final_price'] = $result['final_total'] / $quantity;
        }

        return $result;
    }

    /**
     * Get applicable promotions for a product
     */
    public function getApplicablePromotions(Product $product): Collection
    {
        return Promotion::active()
            ->ordered()
            ->where(function ($query) use ($product): void {
                $query->where('apply_to', 'all')
                    ->orWhereHas('products', function ($q) use ($product): void {
                        $q->where('products.id', $product->id);
                    })
                    ->orWhereHas('categories', function ($q) use ($product): void {
                        $q->whereIn('categories.id', $product->categories()->pluck('categories.id'));
                    });
            })
            ->get();
    }

    /**
     * Apply discount code to cart
     */
    public function applyDiscountCode(string $code, array $cartItems): array
    {
        $discount = Discount::query()->where('code', mb_strtoupper($code))
            ->where('is_active', true)
            ->first();

        if (! $discount) {
            return [
                'success' => false,
                'message' => 'Nieprawidłowy kod rabatowy',
            ];
        }

        if (! $discount->isValid()) {
            return [
                'success' => false,
                'message' => 'Kod rabatowy jest nieaktywny lub wygasł',
            ];
        }

        $cartTotal = collect($cartItems)->sum(fn (array $item): int|float => ($item['price'] ?? 0) * $item['quantity']);

        if ($discount->min_order_value && $cartTotal < $discount->min_order_value) {
            return [
                'success' => false,
                'message' => sprintf('Minimalna wartość zamówienia to %s zł', $discount->min_order_value),
            ];
        }

        $discountAmount = $discount->calculateDiscount($cartTotal * 100); // Convert to cents

        return [
            'success' => true,
            'discount' => [
                'id' => $discount->id,
                'code' => $discount->code,
                'name' => $discount->name,
                'type' => $discount->type,
                'value' => $discount->value,
                'discount_amount' => $discountAmount / 100, // Convert back to zł
            ],
        ];
    }

    /**
     * Get all active promotions for frontend display
     */
    public function getActivePromotions(): Collection
    {
        return Promotion::active()
            ->ordered()
            ->with(['products', 'categories'])
            ->get();
    }

    /**
     * Check if product has any active promotions
     */
    public function hasActivePromotions(Product $product): bool
    {
        return $this->getApplicablePromotions($product)->isNotEmpty();
    }

    /**
     * Get the best promotion for a product (highest discount)
     */
    public function getBestPromotion(Product $product, int $quantity = 1, ?float $price = null): ?Promotion
    {
        $promotions = $this->getApplicablePromotions($product);

        $bestPromotion = null;
        $maxDiscount = 0;

        foreach ($promotions as $promotion) {
            $discount = $promotion->calculateDiscount($product, $quantity, $price);
            if ($discount > $maxDiscount) {
                $maxDiscount = $discount;
                $bestPromotion = $promotion;
            }
        }

        return $bestPromotion;
    }
}
