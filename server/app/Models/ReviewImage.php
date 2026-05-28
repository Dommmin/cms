<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $product_review_id
 * @property string $path
 * @property string|null $alt_text
 * @property int $position
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\ProductReview|null $review
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewImage newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewImage newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewImage query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewImage whereAltText($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewImage whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewImage whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewImage wherePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewImage wherePosition($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewImage whereProductReviewId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReviewImage whereUpdatedAt($value)
 * @mixin \Eloquent
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
