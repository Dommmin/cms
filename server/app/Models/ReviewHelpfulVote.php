<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $product_review_id
 * @property int $customer_id
 * @property bool $is_helpful
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read ProductReview|null $review
 *
 * @method static Builder<static>|ReviewHelpfulVote newModelQuery()
 * @method static Builder<static>|ReviewHelpfulVote newQuery()
 * @method static Builder<static>|ReviewHelpfulVote query()
 * @method static Builder<static>|ReviewHelpfulVote whereCreatedAt($value)
 * @method static Builder<static>|ReviewHelpfulVote whereCustomerId($value)
 * @method static Builder<static>|ReviewHelpfulVote whereId($value)
 * @method static Builder<static>|ReviewHelpfulVote whereIsHelpful($value)
 * @method static Builder<static>|ReviewHelpfulVote whereProductReviewId($value)
 * @method static Builder<static>|ReviewHelpfulVote whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'product_review_id', 'customer_id', 'is_helpful',
])]
#[Table(name: 'review_helpful_votes')]
class ReviewHelpfulVote extends Model
{
    use HasFactory;

    protected $casts = [
        'is_helpful' => 'boolean',
    ];

    public function review(): BelongsTo
    {
        return $this->belongsTo(ProductReview::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
