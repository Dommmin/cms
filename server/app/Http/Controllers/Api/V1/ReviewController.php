<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\ReviewStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreReviewRequest;
use App\Http\Resources\Api\V1\ReviewResource;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReviewController extends Controller
{
    public function index(Request $request, string $slug): AnonymousResourceCollection
    {
        $product = Product::query()->where('slug', $slug)->available()->firstOrFail();

        $reviews = $product->reviews()
            ->where('status', ReviewStatusEnum::Approved->value)
            ->with('customer')
            ->orderBy('helpful_count', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return ReviewResource::collection($reviews);
    }

    public function store(StoreReviewRequest $request, string $slug): JsonResponse
    {
        $product = Product::query()->where('slug', $slug)->available()->firstOrFail();
        $customer = $request->user()->customer;

        if (! $customer) {
            return response()->json(['message' => 'Customer profile required to leave a review'], 422);
        }

        $existing = ProductReview::query()
            ->where('product_id', $product->id)
            ->where('customer_id', $customer->id)
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'You have already reviewed this product'], 422);
        }

        $data = $request->validated();

        $review = ProductReview::query()->create([
            'product_id' => $product->id,
            'customer_id' => $customer->id,
            'rating' => $data['rating'],
            'title' => $data['title'] ?? null,
            'body' => $data['body'] ?? null,
            'status' => ReviewStatusEnum::Pending->value,
            'is_verified_purchase' => false,
            'helpful_count' => 0,
        ]);

        return response()->json(['data' => new ReviewResource($review->load('customer'))], 201);
    }

    public function markHelpful(Request $request, ProductReview $review): JsonResponse
    {
        $user = $request->user();
        $customer = $user?->customer;

        if (! $customer) {
            return response()->json(['message' => 'Login required'], 401);
        }

        $alreadyVoted = $review->helpfulVotes()->where('customer_id', $customer->id)->exists();

        if ($alreadyVoted) {
            $review->helpfulVotes()->where('customer_id', $customer->id)->delete();
        } else {
            $review->helpfulVotes()->create(['customer_id' => $customer->id]);
        }

        $review->recalculateHelpfulCount();

        return response()->json([
            'helpful_count' => $review->fresh()->helpful_count,
            'voted' => ! $alreadyVoted,
        ]);
    }
}
