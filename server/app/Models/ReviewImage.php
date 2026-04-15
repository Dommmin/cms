<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
