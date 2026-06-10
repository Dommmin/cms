<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ReviewStatusEnum;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
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
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Customer|null $customer
 * @property-read Collection<int, ReviewHelpfulVote> $helpfulVotes
 * @property-read int|null $helpful_votes_count
 * @property-read Collection<int, ReviewImage> $images
 * @property-read int|null $images_count
 * @property-read Order|null $order
 * @property-read Product $product
 *
 * @method static Builder<static>|ProductReview newModelQuery()
 * @method static Builder<static>|ProductReview newQuery()
 * @method static Builder<static>|ProductReview query()
 * @method static Builder<static>|ProductReview whereBody($value)
 * @method static Builder<static>|ProductReview whereCreatedAt($value)
 * @method static Builder<static>|ProductReview whereCustomerId($value)
 * @method static Builder<static>|ProductReview whereHelpfulCount($value)
 * @method static Builder<static>|ProductReview whereId($value)
 * @method static Builder<static>|ProductReview whereIsVerifiedPurchase($value)
 * @method static Builder<static>|ProductReview whereOrderId($value)
 * @method static Builder<static>|ProductReview whereProductId($value)
 * @method static Builder<static>|ProductReview whereRating($value)
 * @method static Builder<static>|ProductReview whereStatus($value)
 * @method static Builder<static>|ProductReview whereTitle($value)
 * @method static Builder<static>|ProductReview whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'product_id', 'customer_id', 'order_id', 'rating',
    'title', 'body', 'status', 'is_verified_purchase', 'helpful_count',
])]
#[Table(name: 'product_reviews')]
class ProductReview extends Model
{
    use HasFactory;

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

    protected function casts(): array
    {
        return [
            'status' => ReviewStatusEnum::class,
            'is_verified_purchase' => 'boolean',
        ];
    }
}
