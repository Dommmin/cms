<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\StorePromotionRequest;
use App\Http\Requests\Admin\Ecommerce\UpdatePromotionRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\Promotion;
use App\Queries\Admin\PromotionIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class PromotionController extends Controller
{
    public function index(Request $request): Response
    {
        $promotionQuery = new PromotionIndexQuery($request);
        $promotions = $promotionQuery->execute();

        return inertia('admin/ecommerce/promotions/index', [
            'promotions' => $promotions,
            'filters' => $request->only(['search', 'is_active', 'type']),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/ecommerce/promotions/create', [
            'categories' => Category::all(),
            'products' => Product::all(),
        ]);
    }

    public function store(StorePromotionRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $data['is_active'] = $data['is_active'] ?? true;
        $data['is_stackable'] = $data['is_stackable'] ?? false;
        $data['priority'] = $data['priority'] ?? 0;

        $products = $data['products'] ?? [];
        $categories = $data['categories'] ?? [];

        unset($data['products'], $data['categories']);

        DB::transaction(function () use ($data, $products, $categories) {
            $promotion = Promotion::create($data);

            if (! empty($products)) {
                $promotionProducts = [];
                foreach ($products as $productId => $productData) {
                    $promotionProducts[] = [
                        'promotion_id' => $promotion->id,
                        'product_id' => $productId,
                        'discount_value' => $productData['discount_value'] ?? null,
                        'discount_type' => $productData['discount_type'] ?? null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                DB::table('promotion_products')->insert($promotionProducts);
            }

            if (! empty($categories)) {
                $promotionCategories = [];
                foreach ($categories as $categoryId => $categoryData) {
                    $promotionCategories[] = [
                        'promotion_id' => $promotion->id,
                        'category_id' => $categoryId,
                        'discount_value' => $categoryData['discount_value'] ?? null,
                        'discount_type' => $categoryData['discount_type'] ?? null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                DB::table('promotion_categories')->insert($promotionCategories);
            }
        });

        return redirect()->route('admin.ecommerce.promotions.index')->with('success', 'Promocja została utworzona');
    }

    public function edit(Promotion $promotion): Response
    {
        $promotion->load(['products', 'categories']);

        return inertia('admin/ecommerce/promotions/edit', [
            'promotion' => $promotion,
            'categories' => Category::all(),
            'products' => Product::all(),
        ]);
    }

    public function update(UpdatePromotionRequest $request, Promotion $promotion): RedirectResponse
    {
        $data = $request->validated();

        $products = $data['products'] ?? [];
        $categories = $data['categories'] ?? [];

        unset($data['products'], $data['categories']);

        DB::transaction(function () use ($promotion, $data, $products, $categories) {
            $promotion->update($data);

            // Sync products
            $promotion->products()->detach();
            if (! empty($products)) {
                $promotionProducts = [];
                foreach ($products as $productId => $productData) {
                    $promotionProducts[] = [
                        'promotion_id' => $promotion->id,
                        'product_id' => $productId,
                        'discount_value' => $productData['discount_value'] ?? null,
                        'discount_type' => $productData['discount_type'] ?? null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                DB::table('promotion_products')->insert($promotionProducts);
            }

            // Sync categories
            $promotion->categories()->detach();
            if (! empty($categories)) {
                $promotionCategories = [];
                foreach ($categories as $categoryId => $categoryData) {
                    $promotionCategories[] = [
                        'promotion_id' => $promotion->id,
                        'category_id' => $categoryId,
                        'discount_value' => $categoryData['discount_value'] ?? null,
                        'discount_type' => $categoryData['discount_type'] ?? null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                DB::table('promotion_categories')->insert($promotionCategories);
            }
        });

        return redirect()->back()->with('success', 'Promocja została zaktualizowana');
    }

    public function destroy(Promotion $promotion): RedirectResponse
    {
        $promotion->delete();

        return redirect()->back()->with('success', 'Promocja została usunięta');
    }

    public function toggle(Promotion $promotion): RedirectResponse
    {
        $promotion->update(['is_active' => ! $promotion->is_active]);

        return redirect()->back()->with('success', $promotion->is_active ? 'Promocja została aktywowana' : 'Promocja została dezaktywowana');
    }
}
