<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\ProductReview;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ProductReview
 */
class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var ProductReview $review */
        $review = $this->resource;

        return [
            'id' => $review->id,
            'rating' => $review->rating,
            'title' => $review->title,
            'body' => $review->body,
            'is_verified_purchase' => $review->is_verified_purchase,
            'helpful_count' => $review->helpful_count,
            'created_at' => $review->created_at?->toISOString(),
            'author' => $review->relationLoaded('customer') && $review->customer
                ? $review->customer->first_name.' '.mb_substr($review->customer->last_name ?? '', 0, 1).'.'
                : 'Anonymous',
        ];
    }
}
