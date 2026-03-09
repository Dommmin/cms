<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\StoreDiscountRequest;
use App\Http\Requests\Admin\Ecommerce\UpdateDiscountRequest;
use App\Models\Discount;
use App\Queries\Admin\DiscountIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class DiscountController extends Controller
{
    public function index(Request $request): Response
    {
        $discountQuery = new DiscountIndexQuery($request);
        $discounts = $discountQuery->execute();

        return inertia('admin/ecommerce/discounts/index', [
            'discounts' => $discounts,
            'filters' => $request->only(['search', 'type', 'is_active']),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/ecommerce/discounts/create');
    }

    public function store(StoreDiscountRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $data['is_active'] = $data['is_active'] ?? true;
        $data['is_stackable'] = $data['is_stackable'] ?? false;
        $data['apply_to_discounted_products'] = $data['apply_to_discounted_products'] ?? true;
        $data['is_auto_apply'] = $data['is_auto_apply'] ?? false;
        $data['priority'] = $data['priority'] ?? 0;
        $data['uses_count'] = 0;

        $conditions = $data['conditions'] ?? [];
        $products = $data['products'] ?? [];
        $categories = $data['categories'] ?? [];

        unset($data['conditions'], $data['products'], $data['categories']);

        DB::transaction(function () use ($data, $conditions, $products, $categories) {
            $discount = Discount::create($data);

            foreach ($conditions as $conditionData) {
                $discount->conditions()->create($conditionData);
            }

            if (! empty($products)) {
                $discount->products()->attach($products);
            }

            if (! empty($categories)) {
                $discount->categories()->attach($categories);
            }
        });

        return redirect()->route('admin.ecommerce.discounts.index')->with('success', 'Rabat został utworzony');
    }

    public function edit(Discount $discount): Response
    {
        $discount->load(['conditions', 'products', 'categories']);

        return inertia('admin/ecommerce/discounts/edit', [
            'discount' => $discount,
        ]);
    }

    public function update(UpdateDiscountRequest $request, Discount $discount): RedirectResponse
    {
        $data = $request->validated();

        $products = $data['products'] ?? [];
        $categories = $data['categories'] ?? [];

        unset($data['products'], $data['categories']);

        DB::transaction(function () use ($discount, $data, $products, $categories) {
            $discount->update($data);

            $discount->products()->sync($products);
            $discount->categories()->sync($categories);
        });

        return redirect()->back()->with('success', 'Rabat został zaktualizowany');
    }

    public function destroy(Discount $discount): RedirectResponse
    {
        $discount->delete();

        return redirect()->back()->with('success', 'Rabat został usunięty');
    }

    public function toggleActive(Discount $discount): RedirectResponse
    {
        $discount->update(['is_active' => ! $discount->is_active]);

        $message = $discount->is_active ? 'Rabat został aktywowany' : 'Rabat został dezaktywowany';

        return redirect()->back()->with('success', $message);
    }
}
