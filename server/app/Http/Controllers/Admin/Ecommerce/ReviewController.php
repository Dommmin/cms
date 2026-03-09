<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use Illuminate\Http\Request;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(): Response
    {
        $reviews = ProductReview::query()->with(['product', 'user'])->paginate(20);

        return inertia('admin/ecommerce/reviews/index', ['reviews' => $reviews]);
    }

    public function show(ProductReview $review): Response
    {
        return inertia('admin/ecommerce/reviews/show', ['review' => $review]);
    }

    public function update(Request $request, ProductReview $review): Response
    {
        $review->update($request->only(['status']));

        return inertia('admin/ecommerce/reviews/show', ['review' => $review]);
    }
}
