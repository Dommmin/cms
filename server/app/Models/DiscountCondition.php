<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $discount_id
 * @property string $type
 * @property int $entity_id
 * @property-read Discount $discount
 *
 * @method static Builder<static>|DiscountCondition newModelQuery()
 * @method static Builder<static>|DiscountCondition newQuery()
 * @method static Builder<static>|DiscountCondition query()
 * @method static Builder<static>|DiscountCondition whereDiscountId($value)
 * @method static Builder<static>|DiscountCondition whereEntityId($value)
 * @method static Builder<static>|DiscountCondition whereId($value)
 * @method static Builder<static>|DiscountCondition whereType($value)
 *
 * @mixin Model
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
