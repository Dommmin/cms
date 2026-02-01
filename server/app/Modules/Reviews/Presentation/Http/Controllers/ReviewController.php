<?php

declare(strict_types=1);

namespace App\Modules\Reviews\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Modules\Ecommerce\Domain\Models\OrderItem;
use App\Modules\Reviews\Domain\Models\ProductReview;
use App\Modules\Reviews\Domain\Models\ReviewHelpfulVote;
use App\Modules\Reviews\Domain\Models\ReviewImage;
use App\Enums\ReviewStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Review Controller
 * Moved to Reviews module
 */
final class ReviewController extends Controller
{
    /** GET /api/reviews?product_id=X */
    public function index(Request $request): JsonResponse
    {
        $reviews = ProductReview::where('status', ReviewStatus::Approved->value)
            ->when($request->filled('product_id'), fn($q) => $q->where('product_id', $request->product_id))
            ->when($request->filled('rating'), fn($q) => $q->where('rating', $request->rating))
            ->with('customer', 'images')
            ->orderByDesc('created_at')
            ->paginate($request->per_page ?? 10);

        return response()->json($reviews);
    }

    /** POST /api/reviews */
    public function store(StoreReviewRequest $request): JsonResponse
    {
        $this->authorize('create', ProductReview::class);
        $customer = auth()->user()->customer;

        // Check verified purchase
        $isVerified = OrderItem::whereHas('variant.product', fn($q) => $q->where('id', $request->product_id))
            ->whereHas('order', fn($q) => $q->where('customer_id', $customer->id)
                ->whereIn('status', ['delivered']))
            ->exists();

        $review = ProductReview::create([
            'product_id'           => $request->product_id,
            'customer_id'          => $customer->id,
            'order_id'             => $request->order_id,
            'rating'               => $request->rating,
            'title'                => $request->title,
            'body'                 => $request->body,
            'status'               => ReviewStatus::Pending->value,
            'is_verified_purchase' => $isVerified,
        ]);

        // Upload images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('reviews', 'public');
                ReviewImage::create([
                    'product_review_id' => $review->id,
                    'path'              => $path,
                    'position'          => $index,
                ]);
            }
        }

        $review->load('customer', 'images');

        return response()->json($review, 201);
    }

    /** POST /api/reviews/{review}/helpful */
    public function vote(Request $request, ProductReview $review): JsonResponse
    {
        $request->validate([
            'is_helpful' => ['required', 'boolean'],
        ]);

        $customer = auth()->user()->customer;

        ReviewHelpfulVote::updateOrCreate(
            ['product_review_id' => $review->id, 'customer_id' => $customer->id],
            ['is_helpful' => $request->is_helpful]
        );

        $review->recalculateHelpfulCount();

        return response()->json(['helpful_count' => $review->helpful_count]);
    }
}

