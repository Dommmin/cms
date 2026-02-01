<?php

declare(strict_types=1);

namespace App\Modules\Reviews\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ReviewImage extends Model
{
    protected $table = 'review_images';

    protected $fillable = [
        'product_review_id', 'path', 'alt_text', 'position',
    ];

    public function review(): BelongsTo
    {
        return $this->belongsTo(ProductReview::class);
    }
}

