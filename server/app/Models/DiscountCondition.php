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
 * @property int $discount_id
 * @property string $type
 * @property int $entity_id
 * @property-read \App\Models\Discount $discount
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DiscountCondition newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DiscountCondition newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DiscountCondition query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DiscountCondition whereDiscountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DiscountCondition whereEntityId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DiscountCondition whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DiscountCondition whereType($value)
 * @mixin \Eloquent
 */
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
