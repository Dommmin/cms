<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiscountCondition extends Model
{
    use HasFactory;

    protected $table = 'discount_conditions';

    protected $fillable = [
        'discount_id', 'type', 'entity_id',
    ];

    public function discount(): BelongsTo
    {
        return $this->belongsTo(Discount::class);
    }
}
