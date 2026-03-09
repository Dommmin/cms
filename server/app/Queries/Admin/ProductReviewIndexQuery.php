<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\ProductReview;
use Illuminate\Http\Request;

class ProductReviewIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        return ProductReview::query()
            ->with(['product', 'user'])
            ->when($this->request->search, function ($query, $search) {
                $query->where('comment', 'like', "%{$search}%")
                    ->orWhereHas('product', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            })
            ->when($this->request->rating, function ($query, $rating) {
                $query->where('rating', $rating);
            })
            ->when($this->request->has('is_approved'), function ($query) {
                $query->where('is_approved', $this->request->boolean('is_approved'));
            })
            ->when($this->request->date_from, function ($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($this->request->date_to, function ($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();
    }
}
