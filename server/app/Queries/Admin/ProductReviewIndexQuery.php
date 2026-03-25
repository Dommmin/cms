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
            ->when($this->request->search, function ($query, string $search): void {
                $query->where('comment', 'like', sprintf('%%%s%%', $search))
                    ->orWhereHas('product', function ($q) use ($search): void {
                        $q->where('name', 'like', sprintf('%%%s%%', $search));
                    })
                    ->orWhereHas('user', function ($q) use ($search): void {
                        $q->where('name', 'like', sprintf('%%%s%%', $search))
                            ->orWhere('email', 'like', sprintf('%%%s%%', $search));
                    });
            })
            ->when($this->request->rating, function ($query, $rating): void {
                $query->where('rating', $rating);
            })
            ->when($this->request->has('is_approved'), function ($query): void {
                $query->where('is_approved', $this->request->boolean('is_approved'));
            })
            ->when($this->request->date_from, function ($query, $date): void {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($this->request->date_to, function ($query, $date): void {
                $query->whereDate('created_at', '<=', $date);
            })->latest()
            ->paginate(20)
            ->withQueryString();
    }
}
