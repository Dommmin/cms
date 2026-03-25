<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(Request $request): Response
    {
        $reviews = ProductReview::query()
            ->with(['product', 'customer'])
            ->when($request->input('search'), function ($q, string $search): void {
                $q->whereHas('product', fn ($p) => $p->where('name->en', 'like', sprintf('%%%s%%', $search)))
                    ->orWhereHas('customer', fn ($c) => $c->where('name', 'like', sprintf('%%%s%%', $search)));
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return inertia('admin/ecommerce/reviews/index', [
            'reviews' => $reviews,
            'filters' => $request->only(['search']),
        ]);
    }

    public function show(ProductReview $review): Response
    {
        $review->load(['product', 'customer']);

        return inertia('admin/ecommerce/reviews/show', ['review' => $review]);
    }

    public function update(Request $request, ProductReview $review): RedirectResponse
    {
        $review->update($request->only(['status']));

        return back()->with('success', 'Review status updated.');
    }
}
