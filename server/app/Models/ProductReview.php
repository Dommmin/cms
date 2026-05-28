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

/**
 * @property int $id
 * @property int $product_id
 * @property int $customer_id
 * @property int|null $order_id
 * @property int $rating
 * @property string|null $title
 * @property string|null $body
 * @property ReviewStatusEnum $status
 * @property bool $is_verified_purchase
 * @property int $helpful_count
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Customer|null $customer
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ReviewHelpfulVote> $helpfulVotes
 * @property-read int|null $helpful_votes_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ReviewImage> $images
 * @property-read int|null $images_count
 * @property-read \App\Models\Order|null $order
 * @property-read \App\Models\Product $product
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductReview newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductReview newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductReview query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductReview whereBody($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductReview whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductReview whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductReview whereHelpfulCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductReview whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductReview whereIsVerifiedPurchase($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductReview whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductReview whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductReview whereRating($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductReview whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductReview whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductReview whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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
