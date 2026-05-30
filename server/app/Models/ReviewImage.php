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
 * @property string $path
 * @property string|null $alt_text
 * @property int $position
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read ProductReview|null $review
 *
 * @method static Builder<static>|ReviewImage newModelQuery()
 * @method static Builder<static>|ReviewImage newQuery()
 * @method static Builder<static>|ReviewImage query()
 * @method static Builder<static>|ReviewImage whereAltText($value)
 * @method static Builder<static>|ReviewImage whereCreatedAt($value)
 * @method static Builder<static>|ReviewImage whereId($value)
 * @method static Builder<static>|ReviewImage wherePath($value)
 * @method static Builder<static>|ReviewImage wherePosition($value)
 * @method static Builder<static>|ReviewImage whereProductReviewId($value)
 * @method static Builder<static>|ReviewImage whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'product_review_id', 'path', 'alt_text', 'position',
])]
#[Table(name: 'review_images')]
class ReviewImage extends Model
{
    use HasFactory;

    public function review(): BelongsTo
    {
        return $this->belongsTo(ProductReview::class);
    }
}
