<?php

declare(strict_types=1);

namespace App\Models;

use App\Modules\Core\Domain\Models\Customer;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $product_review_id
 * @property int $customer_id
 * @property bool $is_helpful
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\ProductReview|null $review
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewHelpfulVote newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewHelpfulVote newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewHelpfulVote query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewHelpfulVote whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewHelpfulVote whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewHelpfulVote whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewHelpfulVote whereIsHelpful($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewHelpfulVote whereProductReviewId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewHelpfulVote whereUpdatedAt($value)
 * @mixin \Eloquent
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
