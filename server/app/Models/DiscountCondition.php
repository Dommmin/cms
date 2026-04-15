<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'discount_id', 'type', 'entity_id',
])]
#[Table(name: 'discount_conditions')]
class DiscountCondition extends Model
{
    use HasFactory;

    public function discount(): BelongsTo
    {
        return $this->belongsTo(Discount::class);
    }
}
