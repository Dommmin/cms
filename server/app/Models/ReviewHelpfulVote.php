<?php

declare(strict_types=1);

namespace App\Models;

use App\Modules\Core\Domain\Models\Customer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReviewHelpfulVote extends Model
{
    use HasFactory;

    protected $table = 'review_helpful_votes';

    protected $fillable = [
        'product_review_id', 'customer_id', 'is_helpful',
    ];

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
