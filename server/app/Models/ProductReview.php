<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ReviewStatusEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'product_id', 'customer_id', 'order_id', 'rating',
    'title', 'body', 'status', 'is_verified_purchase', 'helpful_count',
])]
#[Table(name: 'product_reviews')]
class ProductReview extends Model
{
    use HasFactory;

    protected $casts = [
        'status' => ReviewStatusEnum::class,
        'is_verified_purchase' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ReviewImage::class)->orderBy('position');
    }

    public function helpfulVotes(): HasMany
    {
        return $this->hasMany(ReviewHelpfulVote::class);
    }

    /** Aktualizuje helpful_count */
    public function recalculateHelpfulCount(): void
    {
        $count = $this->helpfulVotes()->where('is_helpful', true)->count();
        $this->update(['helpful_count' => $count]);
    }
}
