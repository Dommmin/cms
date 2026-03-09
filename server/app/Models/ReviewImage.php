<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReviewImage extends Model
{
    use HasFactory;

    protected $table = 'review_images';

    protected $fillable = [
        'product_review_id', 'path', 'alt_text', 'position',
    ];

    public function review(): BelongsTo
    {
        return $this->belongsTo(ProductReview::class);
    }
}
